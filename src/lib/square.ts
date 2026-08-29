/**
 * Encodes a Square Point of Sale API request payload as base64.
 * Pass the result as the `data` query param to the Square deep-link URL.
 *
 * iOS:     squarecommerce://v1/charge?data=<encoded>
 * Android: intent:#Intent;action=com.squareup.register.action.CHARGE;package=com.squareup;S.data=<encoded>;end
 */
export function buildSquarePOSData(
  amountCents: number,
  callbackUrl: string,
  clientTransactionId: string,
): string {
  const payload = {
    amount_money: { amount: amountCents, currency_code: 'USD' },
    callback_url: callbackUrl,
    client_id: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? '',
    client_transaction_id: clientTransactionId,
    version: '1.3',
    notes: "Sunny's Garden",
    options: {
      supported_tender_types: ['CREDIT_CARD', 'OTHER', 'SQUARE_GIFT_CARD', 'CARD_ON_FILE'],
      skip_receipt_screen: false,
      collect_signature: false,
      ask_for_billing_address: false,
    },
  };
  return btoa(JSON.stringify(payload));
}
