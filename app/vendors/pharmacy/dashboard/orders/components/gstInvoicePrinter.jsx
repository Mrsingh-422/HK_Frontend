/**
 * Standalone GST Tax Invoice Generator & Print Engine
 * Location: ./components/gstInvoicePrinter.js
 * Strictly mapped to Corporate & Tax ID Guidelines (CIN / GST / TAN / PAN)
 */

const resolveBackendUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.replace(/^public[\\/]/, '').replace(/\\/g, '/');
    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
    return `${backendUrl}/${cleanPath}`;
};

export const printGSTInvoice = (invoiceData) => {
    if (!invoiceData) return;

    const inv = invoiceData;
    const pharmacy = inv.pharmacyId || {};
    const docs = pharmacy.documents || {};
    const address = inv.address || {};
    const items = Array.isArray(inv.items) ? inv.items : [];
    const bill = inv.billSummary || {};

    const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '/logo.png';

    const formattedDate = inv.createdAt 
        ? new Date(inv.createdAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
        : new Date().toLocaleString('en-IN');

    const pharmacyFullAddress = [
        pharmacy.address || '',
        pharmacy.city || '',
        pharmacy.state || ''
    ].filter(Boolean).join(', ');

    const buyerFullAddress = [
        address.houseNo ? address.houseNo : '',
        address.sector ? address.sector : '',
        address.city || '',
        address.state || ''
    ].filter(Boolean).join(', ');

    // Digital Signature Image
    const signatureSrc = docs.signatureImage ? resolveBackendUrl(docs.signatureImage) : '';

    // Dynamic Tax ID Block Logic (GSTIN OR PAN + TAN)
    const hasGst = Boolean(docs.gstNumber && docs.gstNumber.trim());

    // GST Breakdown from API
    const gstBreakdownList = Array.isArray(bill.gstClassBreakdown) && bill.gstClassBreakdown.length > 0 
        ? bill.gstClassBreakdown 
        : [
            {
                gstClass: '12%',
                taxable: bill.taxableTotal || 0,
                cgst: bill.cgstTotal || 0,
                sgst: bill.sgstTotal || 0
            }
        ];

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8" />
            <title>GST Tax Invoice - ${inv.orderId || 'HealthKangaroo'}</title>
            <style>
                @page {
                    size: A4 portrait;
                    margin: 8mm 10mm;
                }
                * {
                    box-sizing: border-box;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    font-size: 11px;
                    color: #0f172a;
                    margin: 0;
                    padding: 0;
                    background: #ffffff;
                }
                .invoice-container {
                    border: 1.5px solid #0f172a;
                    border-radius: 8px;
                    padding: 16px;
                    max-width: 820px;
                    margin: 0 auto;
                }

                /* TOP BRANDING BAR */
                .top-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #0f172a;
                    padding-bottom: 10px;
                    margin-bottom: 12px;
                }
                .brand-wrap {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .logo-box {
                    background: #ffffff;
                    padding: 4px 8px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .brand-logo {
                    height: 38px;
                    width: auto;
                    object-fit: contain;
                }
                .facilitator-meta {
                    display: flex;
                    flex-direction: column;
                }
                .facilitator-name {
                    font-size: 13px;
                    font-weight: 900;
                    color: #08B36A;
                    letter-spacing: 0.3px;
                    text-transform: uppercase;
                }
                .facilitator-tagline {
                    font-size: 9px;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .invoice-title-block {
                    text-align: right;
                }
                .invoice-heading {
                    font-size: 16px;
                    font-weight: 900;
                    color: #0f172a;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .order-pill {
                    display: inline-block;
                    background: #f1f5f9;
                    border: 1px solid #cbd5e1;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 10.5px;
                    font-weight: 800;
                    color: #0f172a;
                    margin-top: 3px;
                }

                /* SELLER & BUYER GRID */
                .party-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 14px;
                    border-bottom: 1.5px solid #cbd5e1;
                    padding-bottom: 12px;
                    margin-bottom: 12px;
                }
                .party-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 10px 12px;
                    font-size: 10px;
                    line-height: 1.45;
                }
                .party-badge {
                    font-size: 9px;
                    font-weight: 900;
                    text-transform: uppercase;
                    color: #08B36A;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }
                .party-name {
                    font-size: 13px;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 3px;
                }
                .party-line {
                    color: #334155;
                    font-size: 10px;
                }
                .party-line strong {
                    color: #0f172a;
                }

                /* METADATA STRIP */
                .meta-strip {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f1f5f9;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 10px;
                    font-weight: 700;
                    color: #334155;
                    border: 1px solid #e2e8f0;
                    margin-bottom: 12px;
                }

                /* ITEMS TABLE */
                table.items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 4px;
                }
                table.items-table th {
                    background: #0f172a;
                    color: #ffffff;
                    font-size: 9px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.4px;
                    padding: 6px 4px;
                    border: 1px solid #0f172a;
                }
                table.items-table td {
                    font-size: 9.5px;
                    padding: 5.5px 4px;
                    border: 1px solid #cbd5e1;
                    color: #1e293b;
                }
                table.items-table tbody tr:nth-child(even) {
                    background: #f8fafc;
                }
                .text-left { text-align: left; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }

                /* GST BREAKDOWN TABLE */
                .gst-section-title {
                    font-size: 9.5px;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: #475569;
                    margin-top: 10px;
                    margin-bottom: 4px;
                }
                table.gst-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid #cbd5e1;
                    margin-bottom: 12px;
                }
                table.gst-table th, table.gst-table td {
                    border: 1px solid #cbd5e1;
                    padding: 4px 6px;
                    font-size: 9.5px;
                    text-align: center;
                }
                table.gst-table th {
                    background: #f1f5f9;
                    font-weight: 800;
                    color: #0f172a;
                }

                /* SUMMARY & TERMS SPLIT */
                .bottom-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 14px;
                    margin-top: 8px;
                    border-top: 1.5px solid #cbd5e1;
                    padding-top: 12px;
                }
                .terms-card {
                    font-size: 9px;
                    color: #475569;
                    line-height: 1.4;
                }
                .terms-card strong {
                    color: #0f172a;
                    font-size: 9.5px;
                    text-transform: uppercase;
                }
                .words-amount {
                    margin-top: 8px;
                    padding: 6px 8px;
                    background: #f8fafc;
                    border-left: 3px solid #08B36A;
                    border-radius: 4px;
                    font-size: 9.5px;
                    font-weight: 800;
                    color: #0f172a;
                }

                /* TOTALS TABLE */
                .summary-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .summary-table td {
                    padding: 3px 6px;
                    font-size: 10px;
                    border: none;
                }
                .summary-table tr.grand-row td {
                    border-top: 1.5px solid #0f172a !important;
                    border-bottom: 1.5px solid #0f172a !important;
                    font-size: 12.5px !important;
                    font-weight: 900 !important;
                    color: #08B36A;
                    padding: 6px 6px;
                }

                /* PLATFORM DISCLAIMER & SIGNATURE */
                .disclaimer-box {
                    margin-top: 12px;
                    border: 1px dashed #cbd5e1;
                    background: #f8fafc;
                    padding: 8px 10px;
                    border-radius: 6px;
                    font-size: 8.5px;
                    color: #475569;
                    line-height: 1.35;
                }
                .sign-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: 12px;
                    padding-top: 6px;
                }
                .sign-tag {
                    font-size: 8px;
                    color: #94a3b8;
                }
                .sign-box {
                    text-align: center;
                    width: 220px;
                }
                .sign-img {
                    height: 38px;
                    max-width: 140px;
                    object-fit: contain;
                    margin-bottom: 2px;
                }
                .sign-space {
                    height: 28px;
                }
                .sign-title {
                    font-size: 9px;
                    font-weight: 800;
                    border-top: 1px solid #0f172a;
                    padding-top: 3px;
                    color: #0f172a;
                    text-transform: uppercase;
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                
                <!-- TOP HEADER -->
                <div class="top-header">
                    <div class="brand-wrap">
                        <div class="logo-box">
                            <img 
                                src="${logoUrl}" 
                                alt="Health Kangaroo Logo" 
                                class="brand-logo" 
                                onerror="this.style.display='none'"
                            />
                        </div>
                        <div class="facilitator-meta">
                            <div class="facilitator-name">Health Kangaroo</div>
                            <div class="facilitator-tagline">Facilitated by HealthKangaroo Platform</div>
                        </div>
                    </div>
                    <div class="invoice-title-block">
                        <div class="invoice-heading">Tax Invoice / Retail Bill</div>
                        <div class="order-pill">Invoice #: ${inv.orderId || 'N/A'}</div>
                    </div>
                </div>

                <!-- SELLER & BUYER DETAILS -->
                <div class="party-grid">
                    <div class="party-card">
                        <div class="party-badge">Dispensed & Sold By (Seller Pharmacy)</div>
                        <div class="party-name">${pharmacy.name || 'Pharmacy Partner'}</div>
                        <div class="party-line">${pharmacyFullAddress || 'Address on file'}</div>
                        ${pharmacy.phone ? `<div class="party-line">Phone: <strong>${pharmacy.phone}</strong></div>` : ''}
                        ${pharmacy.email ? `<div class="party-line">Email: <strong>${pharmacy.email}</strong></div>` : ''}
                        
                        <!-- Corporate & Tax IDs -->
                        ${docs.cinNumber ? `<div class="party-line">CIN: <strong>${docs.cinNumber}</strong></div>` : ''}
                        ${hasGst ? `
                            <div class="party-line">GST NO: <strong>${docs.gstNumber}</strong></div>
                        ` : `
                            <div class="party-line">PAN: <strong>${docs.panNumber || 'N/A'}</strong> | TAN: <strong>${docs.tanNumber || 'N/A'}</strong></div>
                        `}
                        
                        ${docs.drugLicenseNumber ? `<div class="party-line">D.L. NO: <strong>${docs.drugLicenseNumber}</strong></div>` : ''}
                        ${docs.foodLicenseNumber ? `<div class="party-line">Food Lic No: <strong>${docs.foodLicenseNumber}</strong></div>` : ''}
                    </div>

                    <div class="party-card">
                        <div class="party-badge">Billed & Delivered To (Customer)</div>
                        <div class="party-name">${address.name || 'Customer'}</div>
                        <div class="party-line">${buyerFullAddress || 'Address on file'}</div>
                        ${address.phone ? `<div class="party-line">Phone: <strong>${address.phone}</strong></div>` : ''}
                    </div>
                </div>

                <!-- METADATA STRIP -->
                <div class="meta-strip">
                    <span>Invoice Date: <strong>${formattedDate}</strong></span>
                    <span>Payment Mode: <strong>${inv.paymentMethod || 'CASH'}</strong></span>
                    <span>Payment Status: <strong style="color: #08B36A;">${inv.paymentStatus || 'Paid'}</strong></span>
                    <span>Order Status: <strong>${inv.status || 'Placed'}</strong></span>
                </div>

                <!-- MEDICINES & ITEMS TABLE -->
                <table class="items-table">
                    <thead>
                        <tr>
                            <th class="text-center" style="width: 20px;">#</th>
                            <th class="text-left">Item Name</th>
                            <th class="text-center" style="width: 45px;">Pack</th>
                            <th class="text-center" style="width: 65px;">Batch No</th>
                            <th class="text-center" style="width: 40px;">Exp.</th>
                            <th class="text-center" style="width: 50px;">HSN</th>
                            <th class="text-center" style="width: 30px;">Qty</th>
                            <th class="text-right" style="width: 45px;">MRP</th>
                            <th class="text-right" style="width: 45px;">Rate</th>
                            <th class="text-right" style="width: 55px;">Taxable</th>
                            <th class="text-center" style="width: 35px;">CGST%</th>
                            <th class="text-center" style="width: 35px;">SGST%</th>
                            <th class="text-right" style="width: 55px;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item, idx) => {
                            const qty = Number(item.quantity) || 1;
                            const rate = Number(item.price) || 0;
                            const mrp = Number(item.mrp) || rate;
                            const taxable = Number(item.taxableAmount || (rate * qty)).toFixed(2);
                            const totalAmount = Number(item.itemTotalAmount || (rate * qty)).toFixed(2);
                            const batchNo = item.batch_number || item.batchNumber || '-';
                            const expDate = item.expiry_date || item.expiryDate || '-';
                            const pack = item.packaging || '-';
                            const hsn = item.hsn_number || '300490';
                            const cgst = item.cgstPercent !== undefined ? `${item.cgstPercent}%` : '-';
                            const sgst = item.sgstPercent !== undefined ? `${item.sgstPercent}%` : '-';

                            return `
                                <tr>
                                    <td class="text-center font-bold">${idx + 1}</td>
                                    <td class="text-left font-bold">
                                        ${item.name || 'Medicine'}
                                        ${item.freeQuantity ? `<span style="font-size: 8px; color: #08B36A;"> (+${item.freeQuantity} Free)</span>` : ''}
                                    </td>
                                    <td class="text-center">${pack}</td>
                                    <td class="text-center">${batchNo}</td>
                                    <td class="text-center">${expDate}</td>
                                    <td class="text-center">${hsn}</td>
                                    <td class="text-center font-bold">${qty}</td>
                                    <td class="text-right">₹${mrp.toFixed(2)}</td>
                                    <td class="text-right font-bold">₹${rate.toFixed(2)}</td>
                                    <td class="text-right">₹${taxable}</td>
                                    <td class="text-center">${cgst}</td>
                                    <td class="text-center">${sgst}</td>
                                    <td class="text-right font-bold">₹${totalAmount}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                <!-- DYNAMIC GST CLASS BREAKDOWN GRID -->
                <div class="gst-section-title">GST Tax Breakdown</div>
                <table class="gst-table">
                    <thead>
                        <tr>
                            <th>GST CLASS</th>
                            ${gstBreakdownList.map(g => `<th>${g.gstClass}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>TAXABLE VALUE</strong></td>
                            ${gstBreakdownList.map(g => `<td>₹${Number(g.taxable || 0).toFixed(2)}</td>`).join('')}
                        </tr>
                        <tr>
                            <td><strong>CGST AMOUNT</strong></td>
                            ${gstBreakdownList.map(g => `<td>₹${Number(g.cgst || 0).toFixed(2)}</td>`).join('')}
                        </tr>
                        <tr>
                            <td><strong>SGST AMOUNT</strong></td>
                            ${gstBreakdownList.map(g => `<td>₹${Number(g.sgst || 0).toFixed(2)}</td>`).join('')}
                        </tr>
                    </tbody>
                </table>

                <!-- SUMMARY, TOTALS & TERMS -->
                <div class="bottom-grid">
                    <div class="terms-card">
                        <strong>Terms & Conditions:</strong><br />
                        1. Goods once sold will not be returned or exchanged without batch verification.<br />
                        2. All medicines dispensed strictly under registered pharmacist supervision.<br />
                        3. Store medicines in cool, dry conditions away from direct sunlight.<br />
                        4. All disputes subject to local jurisdiction only.
                        
                        ${bill.amountInWords ? `
                            <div class="words-amount">
                                Amount in Words:<br />
                                <strong>[ ${bill.amountInWords} ]</strong>
                            </div>
                        ` : ''}
                    </div>

                    <div>
                        <table class="summary-table">
                            <tr>
                                <td>Items Subtotal:</td>
                                <td class="text-right font-bold">₹${Number(bill.itemTotal || bill.totalAmount || 0).toFixed(2)}</td>
                            </tr>
                            ${bill.taxableTotal ? `
                                <tr>
                                    <td>Taxable Amount:</td>
                                    <td class="text-right">₹${Number(bill.taxableTotal).toFixed(2)}</td>
                                </tr>
                            ` : ''}
                            ${bill.cgstTotal ? `
                                <tr>
                                    <td>Total CGST:</td>
                                    <td class="text-right">₹${Number(bill.cgstTotal).toFixed(2)}</td>
                                </tr>
                            ` : ''}
                            ${bill.sgstTotal ? `
                                <tr>
                                    <td>Total SGST:</td>
                                    <td class="text-right">₹${Number(bill.sgstTotal).toFixed(2)}</td>
                                </tr>
                            ` : ''}
                            ${bill.deliveryCharge ? `
                                <tr>
                                    <td>Delivery Logistics Fee:</td>
                                    <td class="text-right">₹${Number(bill.deliveryCharge).toFixed(2)}</td>
                                </tr>
                            ` : ''}
                            <tr class="grand-row">
                                <td>Grand Total:</td>
                                <td class="text-right">₹${Number(bill.totalAmount || bill.itemTotal || 0).toFixed(2)}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- FACILITATED DISCLAIMER -->
                <div class="disclaimer-box">
                    <strong>Facilitated by HealthKangaroo:</strong> HealthKangaroo is a digital healthcare technology platform facilitating transaction of business. Products and medicines are directly supplied, billed, and dispensed by the licensed pharmacy vendor shown above. Delivery personnel acts as an authorized delivery agent.
                </div>

                <!-- SIGNATURE ROW -->
                <div class="sign-row">
                    <div class="sign-tag">
                        Computer Generated Invoice | Dispensed strictly under Registered Pharmacist
                    </div>
                    <div class="sign-box">
                        ${signatureSrc ? `
                            <img src="${signatureSrc}" alt="Authorized Signature" class="sign-img" />
                        ` : `
                            <div class="sign-space"></div>
                        `}
                        <div class="sign-title">
                            For ${pharmacy.name || 'Authorized Pharmacy Partner'}<br />
                            <span style="font-size: 8px; font-weight: normal;">(Authorised Signatory)</span>
                        </div>
                    </div>
                </div>

            </div>
        </body>
        </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
        iframe.contentWindow.print();
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }, 2000);
    }, 400);
};

export default printGSTInvoice;