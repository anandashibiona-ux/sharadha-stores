import { formatCurrency } from '../../utils/validators'

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
          <div className="mt-4 px-1 animate-fade-in border-t border-border pt-4 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-orange-50/50 border border-orange-100 rounded-lg text-sm text-muted">
              <span className="text-xl">✨</span>
              <p className="leading-relaxed">
                Pay securely using your preferred UPI app (Google Pay, PhonePe, Paytm, BHIM, or any other bank app).
              </p>
            </div>
            
            <button 
              type="button"
              onClick={onSubmit} 
              disabled={isSubmitting}
              className="w-full bg-orange-500 text-white py-3.5 px-4 rounded-lg text-sm font-semibold hover:bg-orange-600 active:scale-[0.99] transition-all duration-200 shadow-sm flex items-center justify-center gap-2 hover:shadow-md cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>🔒</span>
                  <span>Pay {formatCurrency(totalAmount)} through UPI</span>
                </>
              )}
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
          <button 
            type="button"
            onClick={onSubmit} 
            disabled={isSubmitting}
            className="btn-primary w-full py-3 text-sm flex items-center justify-center"
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Order (COD)'}
          </button>
        </div>
      )
    },
  ]

  return (
    <div>
      <h3 className="font-medium text-charcoal mb-3">Payment Method</h3>
      <div className="space-y-3">
        {options.map((opt) => (
          <div key={opt.id} className={`p-4 rounded-md border transition-colors
              ${selected === opt.id
                ? 'border-accent bg-accent-light bg-opacity-30'
                : 'border-border bg-surface hover:border-muted'
              }`}>
            <label
              htmlFor={`payment-${opt.id}`}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="radio"
                id={`payment-${opt.id}`}
                name="paymentMethod"
                value={opt.id}
                checked={selected === opt.id}
                onChange={() => onChange(opt.id)}
                className="accent-accent flex-shrink-0"
              />
              <span className="text-2xl ml-1">{opt.icon}</span>
              <div className="flex-1 ml-1">
                <p className="text-sm font-medium text-charcoal">{opt.label}</p>
                <p className="text-xs text-muted">{opt.description}</p>
              </div>
            </label>
            {selected === opt.id && opt.renderForm()}
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-center gap-6 p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-md">
        <div className="flex items-center gap-2 text-[#166534]">
          <span className="text-xl">🔒</span>
          <p className="text-xs font-semibold">256-bit SSL Encrypted</p>
        </div>
        <div className="w-px h-6 bg-[#166534] opacity-20" />
        <div className="flex items-center gap-2 text-[#166534]">
          <span className="text-xl">✅</span>
          <p className="text-xs font-semibold">100% Secure Payments</p>
        </div>
      </div>
      <p className="text-xs text-muted mt-4 text-center">Note: Payment gateway integration is simulated for this prototype.</p>
    </div>
  )
}

export function OrderSummary({ cart, deliveryOption }) {
  const DELIVERY_FEE = { standard: 50, express: 120 }
  const fee = cart.subtotal >= 500 ? 0 : (DELIVERY_FEE[deliveryOption] ?? 50)
  const total = cart.subtotal + fee

  return (
    <div className="bg-background rounded-lg p-5 space-y-3">
      <h3 className="font-serif text-lg text-charcoal">Order Summary</h3>

      <div className="space-y-2 max-h-52 overflow-y-auto">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2.5">
            <img src={item.product.imageUrl} alt={item.product.name}
              className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-charcoal truncate">{item.product.name}</p>
              <p className="text-xs text-muted">× {item.quantity}</p>
            </div>
            <span className="text-xs font-medium text-charcoal flex-shrink-0">
              {formatCurrency(item.lineTotal)}
            </span>
          </div>
        ))}
      </div>

      <div className="divider my-3" />

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span><span>{formatCurrency(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>Delivery</span>
          <span>{fee === 0 ? <span className="text-success font-medium">Free</span> : formatCurrency(fee)}</span>
        </div>
        <div className="flex justify-between font-semibold text-charcoal text-base pt-2 border-t border-border">
          <span>Total</span><span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}
