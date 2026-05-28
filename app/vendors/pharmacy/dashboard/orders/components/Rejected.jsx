import OrderTable from './OrderTable';

export default function Rejected({ orders, searchTerm, refresh }) {
    const filtered = orders.filter(o => 
        o.status === 'Rejected' &&
        (o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
         o.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return <OrderTable orders={filtered} refresh={refresh} hideActions={true} />;
}