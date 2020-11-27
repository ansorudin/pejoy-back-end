function buildConditions(params) {
    var conditions = [];
    var values = [];
    var conditionsStr;
  
    if (typeof params.category !== 'undefined') {
        conditions.push(`category_id in (${params.category})`)
    }
    if (typeof params.brands !== 'undefined') {
        conditions.push(`brand_id in (${params.brands})`)
    }
    if (typeof params.rating !== 'undefined') {
        conditions.push(`pr.rating in (${params.rating})`)
    }
    if (typeof params.price !== 'undefined') {
        conditions.push(`price BETWEEN ${params.price[0]} and ${params.price[1]}`)
    }
   
  
    return {
      where: conditions.length ?
               conditions.join(' AND ') : '1',
      values: values
    };
}

module.exports = buildConditions