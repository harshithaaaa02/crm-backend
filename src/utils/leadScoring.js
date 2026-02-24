const calculateLeadScore = (value) => {
  if (value > 10000) return 90;
  if (value > 5000) return 70;
  return 40;
};

module.exports = calculateLeadScore;
