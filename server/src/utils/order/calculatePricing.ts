export const calculatePricing = (subtotal: number, paymentMethod: string) => {
  const platformFeeRate = 0.05; // 5%
  const paymentFeeRate = paymentMethod === 'card' ? 0.029 : 0.015; // 2.9% for cards, 1.5% for others
  const fixedFee = paymentMethod === 'card' ? 0.30 : 0; // $0.30 for cards

  const platformFee = Math.ceil(subtotal * platformFeeRate);
  const paymentFee = Math.ceil((subtotal * paymentFeeRate) + fixedFee);
  const total = Math.ceil(subtotal + platformFee + paymentFee);
  const hostPayout = Math.floor(subtotal - platformFee - paymentFee);

  return {
    subtotal,
    platformFee,
    paymentFee,
    total,
    currency: 'BDT',
    hostPayout
  };
};