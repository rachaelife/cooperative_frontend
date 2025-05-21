import { Table } from 'antd'
import React from 'react'

const Savings = () => {

    
    const columns = [
        {
          title: "Date",
          dataIndex: "date",
          key: "date",
        },
  
        {
          title: "Month",
          dataIndex: "Month",
          key: "Month",
        },
  
        {
          title: "Category",
          dataIndex: "Category",
          key: "category",
        },
  
        {
          title: "Amount",
          dataIndex: "amount",
          key: "amount",
        },
  
        {
          title: "Balance",
          dataIndex: "balance",
          key: "balance",
        },
  
        
  
        
      ]
  
      const data = [
        {
            date: '29-01-2025',
            Month: "january",
            Category: "Bank transfer",
            amount: "100,000",
            balance:"100,000"
          },
  
          {
            date: '29-02-2025',
            Month: "February",
            Category: "Bank transfer",
            amount: "100,000",
            balance:"200,000"
          },
  
          {
            date: '29-03-2025',
            Month: "march",
            Category: "Bank transfer",
            amount: "100,000",
            balance:"300,000"
          },
  
          {
            date: '29-03-2025',
            Month: "january",
            Category: "Bank transfer",
            amount: "100,000",
            balance:"100,000"
          },
  
          {
            date: '29-03-2025',
            Month: "january",
            Category: "Bank transfer",
            amount: "100,000",
            balance:"100,000"
          },
  
          {
            date: '29-03-2025',
            Month: "january",
            Category: "Bank transfer",
            amount: "100,000",
            balance:"100,000"
          },
        ]
  
       

  return (
    <Table columns={columns} dataSource={data} />
  )
}

export default Savings