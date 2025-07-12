import React, { useState } from 'react';
import { Button, Input, Select, Modal, message } from 'antd';

const { Option } = Select;

const SimpleBuildingForm = ({ visible, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    amount: '',
    month_paid: '',
    payment_type: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('🏗️ Simple building form submission:', formData);
      
      // Validate
      if (!formData.user_id || !formData.amount || !formData.month_paid || !formData.payment_type) {
        message.error('Please fill all fields');
        return;
      }

      // Direct API call
      const response = await fetch('http://localhost:8000/new/building', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_id: parseInt(formData.user_id),
          amount: parseFloat(formData.amount),
          month_paid: formData.month_paid,
          payment_type: formData.payment_type
        })
      });

      const responseText = await response.text();
      console.log('📊 Response:', response.status, responseText);

      if (response.ok) {
        message.success('Building savings added successfully!');
        setFormData({ user_id: '', amount: '', month_paid: '', payment_type: '' });
        onClose();
        if (onSuccess) onSuccess();
      } else {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { message: responseText };
        }
        message.error('Failed: ' + (errorData.message || 'Unknown error'));
      }

    } catch (error) {
      console.error('❌ Error:', error);
      message.error('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="🏗️ Add Building Savings (Simple)"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Add Building Savings
        </Button>
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>User ID:</label>
          <Input
            placeholder="Enter user ID (e.g., 1)"
            value={formData.user_id}
            onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
          />
        </div>
        
        <div>
          <label>Amount:</label>
          <Input
            placeholder="Enter amount (e.g., 5000)"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>
        
        <div>
          <label>Month:</label>
          <Select
            placeholder="Select month"
            value={formData.month_paid}
            onChange={(value) => setFormData({ ...formData, month_paid: value })}
            style={{ width: '100%' }}
          >
            <Option value="January">January</Option>
            <Option value="February">February</Option>
            <Option value="March">March</Option>
            <Option value="April">April</Option>
            <Option value="May">May</Option>
            <Option value="June">June</Option>
            <Option value="July">July</Option>
            <Option value="August">August</Option>
            <Option value="September">September</Option>
            <Option value="October">October</Option>
            <Option value="November">November</Option>
            <Option value="December">December</Option>
          </Select>
        </div>
        
        <div>
          <label>Payment Type:</label>
          <Select
            placeholder="Select payment type"
            value={formData.payment_type}
            onChange={(value) => setFormData({ ...formData, payment_type: value })}
            style={{ width: '100%' }}
          >
            <Option value="cash">Cash</Option>
            <Option value="bank_transfer">Bank Transfer</Option>
            <Option value="cheque">Cheque</Option>
          </Select>
        </div>
      </div>
    </Modal>
  );
};

export default SimpleBuildingForm;
