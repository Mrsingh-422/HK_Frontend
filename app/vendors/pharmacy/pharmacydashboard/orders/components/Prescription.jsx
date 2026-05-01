import OrderTable from './OrderTable';

export default function Prescription({ orders, searchTerm, refresh }) {
    // Filter for Prescription type and typical "pending" statuses
    const filtered = orders.filter(o => 
        o.orderType === 'Prescription' && 
        (o.status === 'Under Review' || o.status === 'Placed' || o.status === 'Accepted') &&
        (o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
         o.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // We pass isPrescription={true} to trigger the image column in OrderTable
    return <OrderTable orders={filtered} refresh={refresh} isPrescription={true} />;
}