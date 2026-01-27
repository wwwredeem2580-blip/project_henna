export const calculatePricing = (total: number, paymentMethod: string) => {
  const platformFeeRate = 0.05; // 5%
  const paymentFeeRate = paymentMethod === 'card' ? 0.029 : 0.015; // 2.9% for cards, 1.5% for others
  const fixedFee = paymentMethod === 'card' ? 0.30 : 0; // $0.30 for cards
  const hostFeeRate = 0.05; // 5%
  const hostFee = Math.ceil(total * hostFeeRate);

  const platformFee = Math.ceil(total * platformFeeRate);
  const paymentFee = Math.ceil((total * paymentFeeRate) + fixedFee);
  const subtotal = Math.ceil(total + platformFee + paymentFee);
  const hostPayout = Math.floor(total - hostFee);

  return {
    subtotal,
    platformFee,
    paymentFee,
    total,
    currency: 'BDT',
    hostPayout
  };
};