'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async find(ctx) {
        let entities;
        entities = await strapi.services['stock'].find();
        // remove security_prices property from all entities
        entities = entities.map(entity => {
            delete entity.security_prices;
            return entity;
        });
        // console.log(entities);
        return entities.map(entity => sanitizeEntity(entity, { model: strapi.models['stock'] }));
    },
    async findOne(ctx) {
        const { id } = ctx.params;
        const entity = await strapi.services['stock'].findOne({ id });
        // remove security_prices property from entity
        if (entity) {
            delete entity.security_prices;
            return sanitizeEntity(entity, { model: strapi.models['stock'] });
        } else {
            return null;
        }
    },


    async buy(ctx) {
        const { stock_id, quantity } = ctx.request.body;
        const portfolio_id = ctx.state.user.portfolio;
        const event_timer_arr = await strapi.services['even-start-trigger'].find();
        const event_timer = event_timer_arr[0];
        if (event_timer.event_started !== "true") {
            return ctx.badRequest(null, [{ messages: [{ id: 'The event has not started' }] }]);
        }
        // print jwt token
        // console.log(ctx.state);
        // get user from the jwt token
        // const user = await strapi.services.users.findOne({ id: ctx.state.user.id });
        // console.log(user);

        // update the portfolio
        const existing_portfolio = await strapi.query('portfolio').findOne({ id: portfolio_id });
        const current_stock = await strapi.query('stock').findOne({ id: stock_id });
        const PRICE_LIMIT = current_stock.price_limit;
        var new_holding = null;
        var new_txn = null;

        if (!existing_portfolio) {
            return ctx.badRequest(null, [{ messages: [{ id: 'No portfolio found' }] }]);
        }
        if (!current_stock) {
            return ctx.badRequest(null, [{ messages: [{ id: 'The stock does not exist' }] }]);
        }
        if (!quantity) {
            return ctx.badRequest(null, [{ messages: [{ id: 'The quantity is required' }] }]);
        }

        // if quantity has more than two decimals return error
        if (quantity.toString().split('.')[1] && quantity.toString().split('.')[1].length > 2) {
            return ctx.badRequest(null, [{ messages: [{ id: 'The quantity has more than two decimals' }] }]);
        }
        // if the type of stock is stock and the quantity is not integer return error
        if (current_stock.type === 'stock' && !Number.isInteger(quantity)) {
            return ctx.badRequest(null, [{ messages: [{ id: 'The quantity must be an integer' }] }]);
        }

        const amount_to_buy = parseFloat(quantity * current_stock.currentPrice);
        if (amount_to_buy > existing_portfolio.AvailableFunds) {
            return ctx.badRequest(null, [{ messages: [{ id: 'Not enough funds' }] }]);
        }

        if (amount_to_buy > PRICE_LIMIT) {
            return ctx.badRequest(null, [{ messages: [{ id: 'The price limit is exceeded' }] }]);
        }


        const current_holding_partial =
            existing_portfolio.holdings.find(
                holding =>
                    (holding.stock_id === stock_id));
        const current_holding = current_holding_partial ?
            await strapi.services.holdings.findOne({ id: current_holding_partial.id })
            : null;

        if (current_holding) {
            const current_txn =
                current_holding.transactions ? current_holding.transactions.find(
                    txn =>
                    (txn.round_number === event_timer['current_round']
                        && txn.purchase_price === current_stock.currentPrice))
                    : console.log('no txn found', current_holding);
            if (current_txn) {
                // check if price_limit is not exceeded
                if (amount_to_buy <= current_txn.price_limit) {
                    // update the holding
                    try {
                        current_txn.quantity = current_txn.quantity + quantity;
                        current_txn.price_limit = current_txn.price_limit - amount_to_buy;
                        await strapi.services.transactions.update({ id: current_txn.id }, current_txn);
                        current_holding.average_price =
                            (current_holding.average_price * current_holding.total_quantity + amount_to_buy) / (current_holding.total_quantity + quantity);
                        current_holding.total_quantity = current_holding.total_quantity + quantity;
                        await strapi.services.holdings.update({ id: current_holding.id }, current_holding);
                    } catch (err) {
                        console.error("error D: ", err, current_txn);
                        return ctx.badRequest(null, [{ messages: [{ id: 'Error updating transaction' }] }]);
                    }
                } else {
                    return ctx.badRequest(null, [{ messages: [{ id: 'The price limit is exceeded' }] }]);
                }
            } else {
                // create a new transaction
                try {
                    const new_txn_data = {
                        stock_ticker: current_stock.ticker,
                        round_number: event_timer['current_round'],
                        price_limit: PRICE_LIMIT - amount_to_buy,
                        quantity: quantity,
                        purchase_price: current_stock.currentPrice,
                        // portfolio: [portfolio_id],
                        // security: [stock_id],
                    };
                    new_txn = await strapi.services.transactions.create(new_txn_data);
                    current_holding.transactions.push(new_txn.id);
                    current_holding.average_price =
                        (current_holding.average_price * current_holding.total_quantity + amount_to_buy) / (current_holding.total_quantity + quantity);
                    current_holding.total_quantity = current_holding.total_quantity + quantity;
                    await strapi.services.holdings.update({ id: current_holding.id }, current_holding);
                } catch (err) {
                    console.error("Error E: ", err);
                    return ctx.badRequest(null, [{ messages: [{ id: 'Error creating transaction' }] }]);
                }
            }
        } else {
            // create a txn and then a new holding
            try {
                const new_txn_data = {
                    stock_ticker: current_stock.ticker,
                    round_number: event_timer['current_round'],
                    price_limit: PRICE_LIMIT - amount_to_buy,
                    quantity: quantity,
                    purchase_price: current_stock.currentPrice,
                    // portfolio: [portfolio_id],
                    // security: [stock_id],
                };
                new_txn = await strapi.services.transactions.create(new_txn_data);
                new_holding = {
                    stock_id: stock_id,
                    average_price: current_stock.currentPrice,
                    total_quantity: quantity,
                    portfolio_id: portfolio_id,
                    transactions: [new_txn.id],
                    stock_type: current_stock.type,
                };
                new_holding = await strapi.services.holdings.create(new_holding);
            } catch (err) {
                console.error("Error F: ", err);
                return ctx.badRequest(null, [{ messages: [{ id: 'Error creating transaction' }] }]);
            }
        }

        const AllocatedFunds = parseFloat(existing_portfolio.AllocatedFunds + amount_to_buy);
        const AvailableFunds = parseFloat(existing_portfolio.AvailableFunds - amount_to_buy);
        const holdings = new_holding ? [...existing_portfolio.holdings, new_holding] : existing_portfolio.holdings;
        const entity = await strapi.services['portfolio'].update(
            { id: portfolio_id },
            {
                AllocatedFunds,
                AvailableFunds,
                holdings
            }
        )
        // update the holding
        return sanitizeEntity(entity, { model: strapi.models.portfolio });
    },

    async sell(ctx) {
        const { stock_id, quantity } = ctx.request.body;
        const event_timer_arr = await strapi.services['even-start-trigger'].find();
        const event_timer = event_timer_arr[0];
        if (event_timer.event_started !== "true") {
            return ctx.badRequest(null, [{ messages: [{ id: 'The event has not started' }] }]);
        }
        // update the portfolio
        const portfolio_id = ctx.state.user.portfolio;
        const existing_portfolio = await strapi.query('portfolio').findOne({ id: portfolio_id });
        const current_stock = await strapi.query('stock').findOne({ id: stock_id });
        const PRICE_LIMIT = current_stock.price_limit;
        const deleted_holdings_ids = [];
        const deleted_txn_ids = [];

        if (!existing_portfolio) {
            return ctx.badRequest(null, [{ messages: [{ id: 'No portfolio found' }] }]);
        }
        if (!current_stock) {
            return ctx.badRequest(null, [{ messages: [{ id: 'The stock does not exist' }] }]);
        }
        if (!quantity) {
            return ctx.badRequest(null, [{ messages: [{ id: 'The quantity is required' }] }]);
        }
        // if quantity has more than two decimals return error
        if (quantity.toString().split('.')[1] && quantity.toString().split('.')[1].length > 2) {
            return ctx.badRequest(null, [{ messages: [{ id: 'The quantity has more than two decimals' }] }]);
        }
        const current_holding_partial =
            existing_portfolio.holdings.find(
                holding =>
                    (holding.stock_id === stock_id));
        if (!current_holding_partial) {
            return ctx.badRequest(null, [{ messages: [{ id: 'The stock is not in your portfolio' }] }]);
        }

        const current_holding = current_holding_partial ?
            await strapi.services.holdings.findOne({ id: current_holding_partial.id })
            : null;
        if (!current_holding) {
            return ctx.badRequest(null, [{ messages: [{ id: 'An error occurred, your txn could not be completed.' }] }]);
        }

        const all_txns = current_holding ? current_holding.transactions : null;
        if (!all_txns) {
            return ctx.badRequest(null, [{ messages: [{ id: 'The stock is not held' }] }]);
        }
        // calculate sum of quantities in all holdings
        // const sum_of_quantities = parseFloat(all_holdings.reduce((acc, cur) => acc + cur.OwnedQuantity, 0));
        // console.log("A: ", sum_of_quantities, quantity);
        if (quantity > current_holding.total_quantity) {
            return ctx.badRequest(null, [{ messages: [{ id: 'The quantity is greater than the held quantity' }] }]);
        }

        let invested_amount = 0;
        const profit = quantity * (current_stock.currentPrice - current_holding.average_price);
        const amount_to_sell = quantity * current_stock.currentPrice;
        // console.log("B: ", amount_to_sell, profit);

        var quantity_to_sell = quantity;
        for (let txn of all_txns) {
            if (txn.quantity > quantity_to_sell) {
                // update the txn
                try {
                    txn.quantity = txn.quantity - quantity_to_sell;
                    txn.price_limit = (txn.price_limit + amount_to_sell) > PRICE_LIMIT
                        ? PRICE_LIMIT : (txn.price_limit + amount_to_sell);
                    await strapi.services.transactions.update({ id: txn.id }, txn);
                    invested_amount += txn.purchase_price * quantity_to_sell
                    let amount_sold = quantity_to_sell * txn.purchase_price;
                    current_holding.average_price = current_holding.total_quantity - quantity_to_sell === 0 ?
                        0 :
                        (current_holding.average_price * current_holding.total_quantity - amount_sold) / (current_holding.total_quantity - quantity_to_sell);
                    current_holding.total_quantity -= quantity_to_sell;
                    quantity_to_sell = 0;
                    break;
                } catch (err) {
                    console.error("Error F: ", err);
                }
            }
            else if (txn.quantity === quantity_to_sell) {
                // delete the txn
                try {
                    await strapi.services.transactions.delete({ id: txn.id });
                    deleted_txn_ids.push(txn.id);
                    invested_amount += txn.purchase_price * quantity_to_sell
                    let amount_sold = quantity_to_sell * txn.purchase_price;
                    current_holding.average_price = current_holding.total_quantity - quantity_to_sell === 0 ? 0 :
                        (current_holding.average_price * current_holding.total_quantity - amount_sold) / (current_holding.total_quantity - quantity_to_sell);
                    current_holding.total_quantity -= quantity_to_sell;
                    quantity_to_sell = 0;
                    break;
                } catch (err) {
                    console.error("Error G: ", err);
                }
            }
            else if (txn.quantity < quantity_to_sell) {
                // delete the txn
                try {
                    await strapi.services.transactions.delete({ id: txn.id });
                    deleted_txn_ids.push(txn.id);
                    invested_amount += txn.purchase_price * txn.quantity;
                    quantity_to_sell -= txn.quantity;
                    let amount_sold = txn.quantity * txn.purchase_price;
                    current_holding.average_price = current_holding.total_quantity - txn.quantity === 0 ? 0 :
                        (current_holding.average_price * current_holding.total_quantity - amount_sold) / (current_holding.total_quantity - txn.quantity);
                    current_holding.total_quantity -= txn.quantity;
                } catch (err) {
                    console.error("Error H: ", err);
                }
            }
        }
        if (current_holding.total_quantity === 0) {
            try {
                await strapi.services.holdings.delete({ id: current_holding.id });
                deleted_holdings_ids.push(current_holding.id);
            } catch (err) {
                console.error("Error I: ", err);
                return ctx.badRequest(null, [{ messages: [{ id: 'An error occurred, your txn could not be completed.' }] }]);
            }
        }
        // update the holding
        try {
            // remove deleted txns from holdings
            if (current_holding.total_quantity !== 0) {
                current_holding.transactions = current_holding.transactions ? current_holding.transactions.filter(txn => !deleted_txn_ids.includes(txn.id)) : [];
                await strapi.services.holdings.update({ id: current_holding.id }, current_holding);
            }
        } catch (err) {
            console.error("Error J: ", err);
            return ctx.badRequest(null, [{ messages: [{ id: 'An error occurred, your txn could not be completed.' }] }]);
        }
        let AllocatedFunds = existing_portfolio.AllocatedFunds - invested_amount;
        if (AllocatedFunds < 0) {
            AllocatedFunds = 0;
        }
        // console.log("C-0: ", existing_portfolio.AllocatedFunds, invested_amount, AllocatedFunds);
        const AvailableFunds = existing_portfolio.AvailableFunds + invested_amount + profit;
        const NetWorth = existing_portfolio.NetWorth + profit;
        const holdings = existing_portfolio.holdings.filter(
            holding => !deleted_holdings_ids.includes(holding.id)
        );
        // console.log("C: ", AllocatedFunds, AvailableFunds, NetWorth);
        try {
            const entity = await strapi.services['portfolio'].update(
                { id: portfolio_id },
                {
                    AllocatedFunds,
                    AvailableFunds,
                    NetWorth,
                    holdings
                }
            )
            return sanitizeEntity(entity, { model: strapi.models.portfolio });
        } catch (err) {
            console.error("Error I: ", err);
            return ctx.badRequest(null, [{ messages: [{ id: err }] }]);
        }
    },
};
