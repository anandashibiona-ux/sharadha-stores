export const validators = {
  name: (v) => {
    if (!v?.trim()) return 'Name is required'
    if (v.trim().length < 2) return 'Name must be at least 2 characters'
    return null
  },
  phone: (v) => {
    if (!v?.trim()) return 'Mobile number is required'
    if (!/^[6-9]\d{9}$/.test(v.trim())) return 'Enter a valid 10-digit Indian mobile number'
    return null
  },
  email: (v) => {
    if (!v?.trim()) return null // optional
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email address'
    return null
  },
  addressLine1: (v) => {
    if (!v?.trim()) return 'Address is required'
    if (v.trim().length < 5) return 'Please enter a complete address'
    return null
  },
  city: (v) => (!v?.trim() ? 'City is required' : null),
  state: (v) => (!v?.trim() ? 'State is required' : null),
  pincode: (v) => {
    if (!v?.trim()) return 'Pincode is required'
    if (!/^\d{6}$/.test(v.trim())) return 'Enter a valid 6-digit pincode'
    return null
  },
}

export const validateCheckoutForm = (data) => {
  const errors = {}
  Object.keys(validators).forEach((key) => {
    const err = validators[key](data[key])
    if (err) errors[key] = err
  })
  return { errors, isValid: Object.keys(errors).length === 0 }
}

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
