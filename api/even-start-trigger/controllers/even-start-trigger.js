'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
async function startEvent() {
    const eventTimerArray = await strapi.api['even-start-trigger'].services['even-start-trigger'].find();
    const eventTimer = eventTimerArray[0];

    // console.log(eventTimer)
    try {
        if (new Date() > new Date(eventTimer['time']) && eventTimer['event_started'] === "null") {
            console.log("Event started");
            strapi.eventTimerId = eventTimer['id'];
            strapi.eventStarted = true;
            strapi.roundDuration = eventTimer['round_duration_in_seconds'];
            strapi.eventStartTime = new Date(eventTimer['time']);
            strapi.roundNumber = eventTimer['current_round'];
            strapi.maxRounds = eventTimer['number_rounds'];
            strapi.timer = 0;
            // update event_started to true
            await strapi.api['even-start-trigger'].services['even-start-trigger'].update(
                { id: eventTimer['id'] },
                { event_started: true },
                { current_seconds: 0 }
            );
            strapi.io.emit('event-start', { eventStarted: true, time: strapi.eventStartTime, roundNumber: strapi.roundNumber, timer: strapi.timer });
        }
        else {
            if (eventTimer['event_started'] === "false") {
                strapi.eventStarted = false;
                strapi.timer = 0;
                strapi.roundNumber = 0;
                await strapi.api['even-start-trigger'].services['even-start-trigger'].update(
                    { id: eventTimer['id'] },
                    { current_seconds: 0, current_round: 0 },
                );
                strapi.io.emit('event-start', { eventStarted: false, time: strapi.eventStartTime, roundNumber: strapi.roundNumber, timer: strapi.timer });
            }
            // console.log("Event not started");
            // console.log(!eventTimer['event_started']);
            // console.log(new Date() > new Date(eventTimer['time']));
            // console.log(new Date(), new Date(eventTimer['time']));
        }
    } catch (error) {
        console.error("error A: ", error);
    }
}


async function timerUpdate() {
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
            console.log("EMISSION")
            strapi.io.emit('round-update', { roundNumber: strapi.roundNumber });
        }
    }
}

module.exports = {
    startEvent,
    timerUpdate
};
