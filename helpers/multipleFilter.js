function buildConditions(params) {
    var conditions = [];
    var values = [];
    var conditionsStr;
  
    if (params.category !== null) {
        conditions.push(`category_id in (${params.category})`)
    }
    if (params.brands !== null) {
        conditions.push(`brand_id in (${params.brands})`)
    }
    if (params.rating !== null) {
        conditions.push(`review_id in (${params.rating})`)
    }
    if (params.price !== null) {
        conditions.push(`price BETWEEN ${params.price[0]} and ${params.price[1]}`)
    }
   
  
    return {
      where: conditions.length ?
               conditions.join(' AND ') : '1',
      values: values
    };
}

module.exports = buildConditions