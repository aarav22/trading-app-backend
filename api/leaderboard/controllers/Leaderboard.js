module.exports = {
  /**
   * Retrieve a record.
   *
   * @return {Array}
   */

  async getLeaderboard(ctx) {
    const knex = strapi.connections.default;
    const id = ctx.state.user.portfolio;
    const results = await knex('portfolios')
      .orderBy("unrealized_networth", "desc")
    // console.log(results);
    let responseObj = { top3: [], rank: -1 }


    for (let i = 0; i < results.length; i++) {
      if (i <= 2) {
        responseObj["top3"].push(results[i])
      }
      if (results[i].id === Number(id)) {
        responseObj["rank"] = i + 1
      }
      if (responseObj["top3"].length === 3 && responseObj["rank"] !== -1) {
        return (responseObj)
      }
    }
    // responseObj.top10 = top10arr;
    // responseObj.userRank = rank;
    return (responseObj)
  },
};