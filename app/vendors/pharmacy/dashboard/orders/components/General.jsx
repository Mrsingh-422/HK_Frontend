import OrderTable from './OrderTable';

export default function General({ orders, searchTerm, refresh }) {
    const filtered = orders.filter(o => 
        o.orderType === 'General' && o.status === 'Placed' &&
        (o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
         o.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return <OrderTable orders={filtered} refresh={refresh} />;
}