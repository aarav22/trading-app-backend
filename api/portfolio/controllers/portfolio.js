
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
async function recalculateNetworths() {
    const stocks = await strapi.api['stock'].services['stock'].find();
    const stock_map = {};
    stocks.map(stock => {
        stock_map[stock.id] = stock.currentPrice;
    });

    try {
        // get all portfolios
        const portfolios = await strapi.api['portfolio'].services['portfolio'].find();
        // for all portfolios check if they have a stock
        await Promise.all(portfolios.map(async (portfolio) => {
            // check holdings in portfolio
            let unrealized_gain = 0;
            portfolio.holdings.map((holding) => {
                unrealized_gain = holding.total_quantity * (stock_map[holding.stock_id] - holding.average_price);
                console.log("unrealized_gain: ", unrealized_gain);
            });

            // update networth
            await strapi.api['portfolio'].services['portfolio'].update(
                { id: portfolio.id },
                { unrealized_networth: portfolio.NetWorth + unrealized_gain },
            );
        }));
    } catch (error) {
        console.error("error B: ", error);
    }
}
module.exports = {
    /**
     * Promise to fetch all records
     *
     * @return {Promise}
     */
    async find(ctx) {
        // console.log(ctx.state);
        return await strapi.query('portfolio').findOne({ id: ctx.state.user.portfolio });
    },
    recalculateNetworths,
};



