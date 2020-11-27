function categoryFilter(params) {
    var conditions = [];
    var values = [];
    var conditionsStr;
  
    if (typeof params.category !== 'undefined') {
        conditions.push(`category_id in (${params.category})`)
    }
    return {
      where: conditions.length ?
               conditions.join(' AND ') : '1',
      values: values
    };
}

module.exports = categoryFilter