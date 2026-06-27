import { formatCurrency } from '../../utils/validators'
import { QRCodeSVG } from 'qrcode.react'

export function AddressForm({ values, errors, onChange }) {
  const field = (name, label, placeholder, type = 'text', required = true) => (
    <div>
      <label htmlFor={name} className="label">
        {label}{required && <span className="text-error ml-0.5">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={values[name] || ''}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className={`input ${errors[name] ? 'input-error' : ''}`}
        autoComplete={name}
      />
      {errors[name] && <p className="field-error">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl text-charcoal">Delivery Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('name', 'Full Name', 'Your name')}
        {field('phone', 'Mobile Number', '10-digit number', 'tel')}
      </div>
      {field('email', 'Email Address', 'Optional — for order updates', 'email', false)}
      {field('addressLine1', 'Address Line 1', 'House/Flat no, Street, Area')}
      {field('addressLine2', 'Address Line 2', 'Landmark, Locality (optional)', 'text', false)}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {field('city', 'City', 'City')}
        {field('state', 'State', 'State')}
        {field('pincode', 'Pincode', '600001')}
      </div>
      <div>
        <label htmlFor="deliveryNotes" className="label">Delivery Notes <span className="text-muted font-normal">(optional)</span></label>
        <textarea
          id="deliveryNotes"
          name="deliveryNotes"
          value={values.deliveryNotes || ''}
          onChange={(e) => onChange('deliveryNotes', e.target.value)}
          placeholder="Special instructions, leave at door, etc."
          rows={3}
          className="input resize-none"
        />
      </div>
    </div>
  )
}

export function DeliveryOptions({ selected, onChange, subtotal }) {
  const FREE_THRESHOLD = 500
  const isFreeEligible = subtotal >= FREE_THRESHOLD

  const options = [
    {
      id: 'standard',
      label: 'Standard Delivery',
      description: '3–5 business days',
      fee: isFreeEligible ? 0 : 50,
      badge: isFreeEligible ? 'Free (order ≥ ₹500)' : null,
    },
    {
      id: 'express',
      label: 'Express Delivery',
      description: '1–2 business days',
      fee: 120,
    },
  ]

  return (
    <div>
      <h3 className="font-medium text-charcoal mb-3">Delivery Option</h3>
      <div className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt.id}
            htmlFor={`delivery-${opt.id}`}
            className={`flex items-center gap-3 p-3.5 rounded-md border cursor-pointer transition-colors
              ${selected === opt.id
                ? 'border-accent bg-accent-light'
                : 'border-border bg-surface hover:border-muted'
              }`}
          >
            <input
              type="radio"
              id={`delivery-${opt.id}`}
              name="deliveryOption"
              value={opt.id}
              checked={selected === opt.id}
              onChange={() => onChange(opt.id)}
              className="accent-accent"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-charcoal">{opt.label}</p>
              <p className="text-xs text-muted">{opt.description}</p>
            </div>
            <div className="text-right">
              {opt.fee === 0 ? (
                <span className="text-sm font-medium text-success">Free</span>
              ) : (
                <span className="text-sm font-medium text-charcoal">{formatCurrency(opt.fee)}</span>
              )}
              {opt.badge && <p className="text-xs text-success">{opt.badge}</p>}
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

export function PaymentOptions({ selected, onChange, details, onDetailsChange, totalAmount, onSubmit, isSubmitting }) {
  const options = [
    {
      id: 'CREDIT_CARD',
      label: 'Credit/Debit Card',
      icon: '💳',
      description: 'Pay securely using your card',
      renderForm: () => (
        <div className="mt-4 space-y-3 px-1 animate-fade-in border-t border-border pt-3">
          <div>
            <label className="label text-xs">Card Number *</label>
            <input type="text" placeholder="1234 5678 9101 1121" maxLength="19" 
              className="input text-sm" value={details?.cardNumber || ''} 
              onChange={e => onDetailsChange('cardNumber', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Expiry Date *</label>
              <input type="text" placeholder="MM/YY" maxLength="5" 
                className="input text-sm" value={details?.cardExpiry || ''} 
                onChange={e => onDetailsChange('cardExpiry', e.target.value)} />
            </div>
            <div>
              <label className="label text-xs">CVV *</label>
              <input type="password" placeholder="123" maxLength="3" 
                className="input text-sm" value={details?.cardCvv || ''} 
                onChange={e => onDetailsChange('cardCvv', e.target.value)} />
              <p className="text-[10px] text-muted mt-1 flex items-center gap-1">
                <span>🔒</span> Encrypted
              </p>
            </div>
          </div>
          <div>
            <label className="label text-xs">Name on Card *</label>
            <input type="text" placeholder="John Doe" 
              className="input text-sm" value={details?.cardName || ''} 
              onChange={e => onDetailsChange('cardName', e.target.value)} />
          </div>
          <div className="mt-4 pt-2">
            <button 
              type="button"
              onClick={onSubmit} 
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center"
            >
              {isSubmitting ? 'Processing Payment...' : `Pay ${formatCurrency(totalAmount)}`}
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'NET_BANKING',
      label: 'Net Banking',
      icon: '🏦',
      description: 'All major banks supported',
      renderForm: () => (
        <div className="mt-4 px-1 animate-fade-in border-t border-border pt-3">
          <label className="label text-xs">Select Bank *</label>
          <select className="input text-sm cursor-pointer" 
            value={details?.bankName || ''} 
            onChange={e => onDetailsChange('bankName', e.target.value)}>
            <option value="" disabled>Select your bank</option>
            <optgroup label="Top Banks">
              <option value="SBI">State Bank of India</option>
              <option value="HDFC">HDFC Bank</option>
              <option value="ICICI">ICICI Bank</option>
              <option value="AXIS">Axis Bank</option>
              <option value="KOTAK">Kotak Mahindra Bank</option>
              <option value="PNB">Punjab National Bank</option>
              <option value="BOB">Bank of Baroda</option>
            </optgroup>
            <optgroup label="All Banks">
              <option value="ALLAHABAD">Allahabad Bank</option>
              <option value="ANDHRA">Andhra Bank</option>
              <option value="BANDHAN">Bandhan Bank</option>
              <option value="BOI">Bank of India</option>
              <option value="BOM">Bank of Maharashtra</option>
              <option value="CANARA">Canara Bank</option>
              <option value="CENTRAL">Central Bank of India</option>
              <option value="CUB">City Union Bank</option>
              <option value="CORP">Corporation Bank</option>
              <option value="DBS">DBS Bank</option>
              <option value="FEDERAL">Federal Bank</option>
              <option value="IDBI">IDBI Bank</option>
              <option value="IDFC">IDFC FIRST Bank</option>
              <option value="IPPB">India Post Payments Bank</option>
              <option value="INDIAN">Indian Bank</option>
              <option value="IOB">Indian Overseas Bank</option>
              <option value="INDUSIND">IndusInd Bank</option>
              <option value="JK">Jammu & Kashmir Bank</option>
              <option value="KARNATAKA">Karnataka Bank</option>
              <option value="KVB">Karur Vysya Bank</option>
              <option value="OBC">Oriental Bank of Commerce</option>
              <option value="PSB">Punjab & Sind Bank</option>
              <option value="RBL">RBL Bank</option>
              <option value="SOUTH_INDIAN">South Indian Bank</option>
              <option value="SYNDICATE">Syndicate Bank</option>
              <option value="UCO">UCO Bank</option>
              <option value="UNION">Union Bank of India</option>
              <option value="YES">Yes Bank</option>
            </optgroup>
          </select>
          <div className="mt-4 pt-2">
            <button 
              type="button"
              onClick={onSubmit} 
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center"
            >
              {isSubmitting ? 'Redirecting to Bank...' : `Proceed to Bank`}
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'UPI',
      label: 'UPI',
      icon: '📱',
      description: 'Google Pay, PhonePe, Paytm, etc.',
      renderForm: () => {
        return (
          <div className="mt-4 px-1 animate-fade-in border-t border-border pt-4">
            <p className="text-sm text-muted mb-4 leading-relaxed">
              Pay securely using Google Pay, PhonePe, Paytm, or any UPI app. Your payment will be verified in real-time.
            </p>
            <button 
              type="button"
              onClick={onSubmit} 
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center font-medium"
            >
              {isSubmitting ? 'Processing...' : `Pay ${formatCurrency(totalAmount)} with UPI`}
            </button>
          </div>
        )
      }
    },
    {
      id: 'CASH_ON_DELIVERY',
      label: 'Cash on Delivery',
      icon: '💵',
      description: 'Pay when your order arrives',
      renderForm: () => (
        <div className="mt-4 px-1 animate-fade-in border-t border-border pt-4">
          <p className="text-sm text-muted mb-4 leading-relaxed font-normal">
            No upfront payment required. You will pay for the order in cash or UPI when the delivery arrives at your door.
          </p>
          <button 
            type="button"
            onClick={onSubmit} 
            disabled={isSubmitting}
            className="btn-primary w-full py-3 text-sm flex items-center justify-center font-semibold"
          >
            {isSubmitting ? 'Confirming Order...' : 'Place Order (Cash on Delivery)'}
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl text-charcoal">Payment Method</h2>
      <div className="space-y-3">
        {options.map((opt) => (
          <div 
            key={opt.id} 
            className={`border rounded-lg p-4 transition-all duration-200
              ${selected === opt.id 
                ? 'border-accent bg-accent-light/30 shadow-[0_4px_12px_rgba(217,119,6,0.03)]' 
                : 'border-border bg-surface hover:border-muted'
              }`}
          >
            <label htmlFor={`pay-${opt.id}`} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                id={`pay-${opt.id}`}
                name="paymentMethod"
                value={opt.id}
                checked={selected === opt.id}
                onChange={() => onChange(opt.id)}
                className="accent-accent w-4 h-4"
              />
              <span className="text-lg">{opt.icon}</span>
              <div className="flex-1">
                <span className="text-sm font-semibold text-charcoal block">{opt.label}</span>
                <span className="text-xs text-muted block mt-0.5">{opt.description}</span>
              </div>
            </label>
            {selected === opt.id && opt.renderForm()}
          </div>
        ))}
      </div>
    </div>
  )
}
