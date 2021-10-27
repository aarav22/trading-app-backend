'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async find(ctx) {
        let entities;
        const eventTimerArray = await strapi.api['even-start-trigger'].services['even-start-trigger'].find();
        const eventTimer = eventTimerArray[0];
        entities = await strapi.services['news-update'].find({
            round_number_lte: eventTimer['current_round']
        });
        return entities.map(entity => sanitizeEntity(entity, { model: strapi.models['news-update'] }));
    },
    async publishNews() {
        const eventTimerArray = await strapi.api['even-start-trigger'].services['even-start-trigger'].find();
        const eventTimer = eventTimerArray[0];
        const draftArticleToPublish = await strapi.api['news-update'].services['news-update'].find({
            _publicationState: 'preview', // preview returns both draft and published entries
            round_number_eq: eventTimer['current_round'],
        });

        // draftArticleToPublish.length && console.log("To be published: ", draftArticleToPublish);
        // update published_at of articles
        await Promise.all(draftArticleToPublish.map(news_update => {
            return strapi.api['news-update'].services['news-update'].update(
                { id: news_update.id },
            );
        }));
        draftArticleToPublish.length && console.log(`${draftArticleToPublish.length} articles have been published`);
        draftArticleToPublish.length && strapi.io.emit('news-update', { newsUpdated: true, time: new Date() });
    }
};
