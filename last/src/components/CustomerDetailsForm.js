import React from 'react';

const CustomerDetailsForm = ({ onSuggestion, customerDetails, setCustomerDetails }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  return (
    <div className="row col-md-12">
      <div className="col-md-3 form-group">
        <label className="font-weight-bold" htmlFor="customers_name">Customer Name :</label>
        <input
          id="customers_name"
          type="text"
          className="form-control"
          placeholder="Customer Name"
          name="customers_name"
          value={customerDetails.customers_name || ''}
          onChange={handleInputChange}
          onKeyUp={(e) => onSuggestion(e.target.value, 'customer')}
        />
        <code
          className="text-danger small font-weight-bold float-right"
          id="customer_name_error"
          style={{ display: 'none' }}
        ></code>
        <div
          id="customer_suggestions"
          className="list-group position-fixed"
          style={{ zIndex: 1, width: '18.30%', overflow: 'auto', maxHeight: '200px' }}
        ></div>
      </div>
      <div className="col-md-3 form-group">
        <label className="font-weight-bold" htmlFor="customers_address">Address :</label>
        <input
          id="customers_address"
          type="text"
          className="form-control"
          name="customers_address"
          placeholder="Address"
          value={customerDetails.customers_address || ''}
          onChange={handleInputChange}
          disabled
        />
      </div>
      <div className="col-md-2 form-group">
        <label className="font-weight-bold" htmlFor="customers_contact_number">Contact Number :</label>
        <input
          id="customers_contact_number"
          type="number"
          className="form-control"
          name="customers_contact_number"
          placeholder="Contact Number"
          value={customerDetails.customers_contact_number || ''}
          onChange={handleInputChange}
          disabled
        />
      </div>
    </div>
  );
};

export default CustomerDetailsForm;