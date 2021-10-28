'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
async function start_event(ctx) {
    // console.log(eventTimer)
    try {
        const eventTimerArray = await strapi.api['even-start-trigger'].services['even-start-trigger'].find();
        const eventTimer = eventTimerArray[0];
        if (new Date() > new Date(eventTimer['time']) && eventTimer['event_started'] === "null") {
            console.log("Event started");
            // update event_started to true
            await strapi.api['even-start-trigger'].services['even-start-trigger'].update(
                { id: eventTimer['id'] },
                { event_started: true },
                { current_seconds: 0 }
            );
            axios.get(`https://aic-sockets-pzbiacnqaa-em.a.run.app
            ?event_started=${true}&event_start_time=${new Date(eventTimer['time'])}
            &round_number=${eventTimer['current_round']}&timer=${eventTimer['current_seconds']}`);
            // strapi.io.emit('event-start', { eventStarted: true, time: strapi.eventStartTime, roundNumber: strapi.roundNumber, timer: strapi.timer });
        }
        else {
            if (eventTimer['event_started'] === "false") {
                await strapi.api['even-start-trigger'].services['even-start-trigger'].update(
                    { id: eventTimer['id'] },
                    { current_seconds: 0, current_round: 0 },
                );
                axios.get(`https://aic-sockets-pzbiacnqaa-em.a.run.app/event-start
                ?event_started=${false}&event_start_time=${new Date(eventTimer['time'])}
                &round_number=${eventTimer['current_round']}&timer=${eventTimer['current_seconds']}`);
                // strapi.io.emit('event-start', { eventStarted: false, time: strapi.eventStartTime, roundNumber: strapi.roundNumber, timer: strapi.timer });
            }
        }
        return ctx.response.send('ok');
    } catch (error) {
        console.error("error A: ", error);
        return ctx.response.send('error');
    }
}


async function timer_update(ctx) {
    try {
        const eventTimerArray = await strapi.api['even-start-trigger'].services['even-start-trigger'].find();
        const eventTimer = eventTimerArray[0];
        const round_duration = eventTimer['round_duration_in_seconds'];
        const number_rounds = eventTimer['number_rounds'];
        const current_round = eventTimer['current_round'];
        if (eventTimer['event_started'] === "true") {
            let timer = eventTimer['current_seconds'];
            timer++;
            await strapi.api['even-start-trigger'].services['even-start-trigger'].update(
                { id: eventTimer.id },
                { current_seconds: timer },
            );
            if ((timer >= round_duration && current_round <= number_rounds) || current_round === 0) {
                console.log("Round ended", current_round);
                // To publish the prices
                await strapi.api['even-start-trigger'].services['even-start-trigger'].update(
                    { id: eventTimer.id },
                    { current_round: current_round + 1 },
                    { current_seconds: 0 },
                );
                await strapi.api['stock'].controllers['stock'].publishPrices();
                // to publish the news
                await strapi.api['news-update'].controllers['news-update'].publishNews();
                // recalculate the networths
                await strapi.api['portfolio'].controllers['portfolio'].recalculateNetworths();
                console.log("EMISSION");
                axios.get(`https://aic-sockets-pzbiacnqaa-em.a.run.app/round-update
            ?round_number=${eventTimer['current_round']}`);
                // strapi.io.emit('round-update', { roundNumber: strapi.roundNumber });
            }
        }
        return ctx.response.send('ok');
    } catch (error) {
        console.error("error B: ", error);
        return ctx.response.send('error');
    }
}

async function timer_update_but_sleep(ctx) {
    try {
        const { time } = ctx.query
        // console.log('time: ', time);
        await new Promise(resolve => setTimeout(resolve, time * 1000));
        timer_update();
        return ctx.response.send('ok');
    } catch (error) {
        console.error("error B: ", error);
        return ctx.response.send('error');
    }

}
async function start_event_but_sleep() {
    try {
        const { time } = ctx.query
        // console.log('time: ', time);
        await new Promise(resolve => setTimeout(resolve, time * 1000));
        start_event();
        return ctx.response.send('ok');
    } catch (error) {
        console.error("error B: ", error);
        return ctx.response.send('error');
    }


}


module.exports = {
    start_event,
    timer_update,
    timer_update_but_sleep,
    start_event_but_sleep
};
