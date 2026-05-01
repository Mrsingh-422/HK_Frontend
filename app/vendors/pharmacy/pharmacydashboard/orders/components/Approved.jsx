import OrderTable from './OrderTable';

export default function Approved({ orders, searchTerm, refresh }) {
    const activeStatuses = ['Approved', 'Shipped', 'Delivered'];
    const filtered = orders.filter(o => 
        activeStatuses.includes(o.status) &&
        (o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
         o.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return <OrderTable orders={filtered} refresh={refresh} hideActions={true} />;
}