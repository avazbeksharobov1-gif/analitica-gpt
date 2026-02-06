function forecast30Days(startRevenue) {
  const dailyGrowth = 0.012;
  let result = [];
  let value = startRevenue;

  for (let i = 1; i <= 30; i++) {
    value = Math.round(value * (1 + dailyGrowth));
    result.push(value);
  }

  return result;
}

function forecast30DaysCompare(current, previous) {
  const grow = 0.012;

  const make = (base) => {
    let arr = [];
    let v = base;
    for (let i = 0; i < 30; i++) {
      v = Math.round(v * (1 + grow));
      arr.push(v);
    }
    return arr;
  };

  return {
    current: make(current),
    previous: make(previous)
  };
}

module.exports = { forecast30Days, forecast30DaysCompare };
