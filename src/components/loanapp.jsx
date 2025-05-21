import { Table } from 'antd'
import React from 'react'

function Loanapp() {

    const columns = [
        {
          title: "Date",
          dataIndex: "date",
          key: "date",
        },
  
        {
          title: "Loan Amount",
          dataIndex: "amount",
          key: "amount",
        },
  
        {
          title: "Loan Term",
          dataIndex: "term",
          key: "term",
        },
  
        {
          title: "loan purpose",
          dataIndex: "purpose",
          key: "purpose",
        },
  
        {
          title: "Loan Status",
          dataIndex: "status",
          key: "status",
        },
  
        
  
        
      ]
  
      const data = [
        {
            date: '29-01-2025',
            amount: "300,0000",
            term: "6 months",
            purpose: "Trade",
            status:"Pending"
          },

          {
            date: '29-01-2025',
            amount: "300,0000",
            term: "6 months",
            purpose: "Trade",
            status:"Pending"
          },
  
         
        ]
  return (
    <>
     <Table columns={columns} dataSource={data} />
    </>
  )
}

export default Loanapp