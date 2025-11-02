import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, where, orderBy, Timestamp, limit, startAfter } from 'firebase/firestore';
import ConfirmModal from './ConfirmModal';
import { db } from '../../services/firebase';

const Reports = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ revenue: 0, cost: 0, profit: 0 });
  const [totalsHistoric, setTotalsHistoric] = useState({ revenue: 0, cost: 0, profit: 0 });
  const [totalsHistoricPartial, setTotalsHistoricPartial] = useState(false);
  const [historicDocsRead, setHistoricDocsRead] = useState(0);
  const [showFullConfirm, setShowFullConfirm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderRows, setSelectedOrderRows] = useState([]);
  const [selectedOrderTotals, setSelectedOrderTotals] = useState({ revenue: 0, cost: 0, profit: 0 });
  // pagination & filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [minQty, setMinQty] = useState(0);

  const fetchPeriodData = async () => {
    try {
      setLoading(true);

      // Load products to get purchaseCost lookup
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsMap = {};
      // variantId -> productId map for products that store variants as arrays/objects
      const variantToProduct = {};
      productsSnapshot.docs.forEach(d => {
        const pdata = d.data() || {};
        productsMap[d.id] = pdata;
        // If product doc contains a variants array or object, map variant ids back to product id
        const variants = pdata.variants || pdata.variantList || null;
        if (Array.isArray(variants)) {
          variants.forEach(v => {
            const vid = (v && (v.id || v.variantId || v._id)) || null;
            if (vid) variantToProduct[vid] = d.id;
          });
        } else if (variants && typeof variants === 'object') {
          // if variants stored as object with keys
          Object.keys(variants).forEach(k => {
            variantToProduct[k] = d.id;
          });
        }
      });

      // Build orders query depending on dates
      let ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

      // If both dates provided, use range query
      let useClientFilter = false;
      let startTs = null;
      let endTs = null;
      if (fromDate) {
        const d = new Date(fromDate + 'T00:00:00');
        startTs = Timestamp.fromDate(d);
      }
      if (toDate) {
        const d = new Date(toDate + 'T23:59:59');
        endTs = Timestamp.fromDate(d);
      }

      // If both timestamps exist, construct range query (Firestore supports 2 range filters on same field)
      if (startTs && endTs) {
        ordersQuery = query(collection(db, 'orders'), where('createdAt', '>=', startTs), where('createdAt', '<=', endTs), orderBy('createdAt', 'desc'));
      } else if (startTs) {
        ordersQuery = query(collection(db, 'orders'), where('createdAt', '>=', startTs), orderBy('createdAt', 'desc'));
      }

      const ordersSnapshot = await getDocs(ordersQuery);

      const newRows = [];
      let totalRevenue = 0;
      let totalCost = 0;

      ordersSnapshot.docs.forEach(doc => {
        const order = { id: doc.id, ...doc.data() };

        const createdAt = order.createdAt && order.createdAt.toDate ? order.createdAt.toDate() : (order.createdAt instanceof Date ? order.createdAt : null);

        // If user provided dates but Firestore didn't support range (edge cases) we still filter client-side
        if ((startTs || endTs) && createdAt) {
          if (startTs && createdAt < startTs.toDate()) return;
          if (endTs && createdAt > endTs.toDate()) return;
        }

        const items = order.items || [];
        items.forEach(it => {
          const prodId = it.productId || it.id || it.tenisId || it.variantId || null;
          let product = prodId ? productsMap[prodId] : null;
          // If prodId corresponds to a variant id, map it to the parent product
          if (!product && prodId && variantToProduct[prodId]) {
            product = productsMap[variantToProduct[prodId]] || null;
          }
          // Fallback: try fuzzy match by name when product not found
          if (!product && it.name) {
            const nameLower = String(it.name || '').toLowerCase();
            const foundKey = Object.keys(productsMap).find(pid => {
              const pn = String(productsMap[pid]?.name || '').toLowerCase();
              return pn && nameLower && pn.includes(nameLower.substring(0, Math.min(20, nameLower.length)));
            });
            if (foundKey) product = productsMap[foundKey];
          }
          const purchaseCost = product ? Number(product.purchaseCost || 0) : 0;
          const price = Number(it.price || 0);
          const qty = Number(it.quantity || 0) || 0;
          const revenue = price * qty;
          const cost = purchaseCost * qty;
          const profit = revenue - cost;

          totalRevenue += revenue;
          totalCost += cost;

          newRows.push({
            orderId: order.id,
            date: createdAt ? createdAt.toISOString() : '',
            productId: prodId || '',
            productName: it.name || (product && product.name) || '',
            qty,
            price,
            purchaseCost,
            revenue,
            cost,
            profit
          });
        });
      });

      // prepare grouping or quick lookup if needed (kept as rows array)

      setRows(newRows);
      setTotals({ revenue: totalRevenue, cost: totalCost, profit: totalRevenue - totalCost });
    } catch (error) {
      console.error('Error cargando reportes:', error);
      setRows([]);
      setTotals({ revenue: 0, cost: 0, profit: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricTotals = async (forceFull = false) => {
    try {
      setLoading(true);
      // Load products to get purchaseCost lookup
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsMap = {};
      const variantToProduct = {};
      productsSnapshot.docs.forEach(d => {
        const pdata = d.data() || {};
        productsMap[d.id] = pdata;
        const variants = pdata.variants || pdata.variantList || null;
        if (Array.isArray(variants)) {
          variants.forEach(v => {
            const vid = (v && (v.id || v.variantId || v._id)) || null;
            if (vid) variantToProduct[vid] = d.id;
          });
        } else if (variants && typeof variants === 'object') {
          Object.keys(variants).forEach(k => {
            variantToProduct[k] = d.id;
          });
        }
      });

      // Paginated fetch for historic totals to avoid reading all documents at once
  const pageSize = 500; // docs per page
  const maxDocs = forceFull ? Infinity : 5000; // safety cap (to avoid very long reads)
      let lastDoc = null;
      let docsRead = 0;
      let totalRevenue = 0;
      let totalCost = 0;
      let partial = false;

      while (true) {
        let q = null;
        if (lastDoc) {
          q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(pageSize));
        } else {
          q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(pageSize));
        }

        const snap = await getDocs(q);
        if (snap.empty) break;

        snap.docs.forEach(doc => {
          const order = { id: doc.id, ...doc.data() };
          const items = order.items || [];
          items.forEach(it => {
            const prodId = it.productId || it.id || it.tenisId || it.variantId || null;
            let product = prodId ? productsMap[prodId] : null;
            if (!product && prodId && variantToProduct[prodId]) {
              product = productsMap[variantToProduct[prodId]] || null;
            }
            if (!product && it.name) {
              const nameLower = String(it.name || '').toLowerCase();
              const foundKey = Object.keys(productsMap).find(pid => {
                const pn = String(productsMap[pid]?.name || '').toLowerCase();
                return pn && nameLower && pn.includes(nameLower.substring(0, Math.min(20, nameLower.length)));
              });
              if (foundKey) product = productsMap[foundKey];
            }
            const purchaseCost = product ? Number(product.purchaseCost || 0) : 0;
            const price = Number(it.price || 0);
            const qty = Number(it.quantity || 0) || 0;
            const revenue = price * qty;
            const cost = purchaseCost * qty;

            totalRevenue += revenue;
            totalCost += cost;
          });
        });

        docsRead += snap.size;
        lastDoc = snap.docs[snap.docs.length - 1];

        if (snap.size < pageSize) break; // last page
        if (!forceFull && docsRead >= maxDocs) {
          partial = true;
          break;
        }
      }

      setHistoricDocsRead(docsRead);
      setTotalsHistoric({ revenue: totalRevenue, cost: totalCost, profit: totalRevenue - totalCost });
      setTotalsHistoricPartial(partial);
    } catch (error) {
      console.error('Error cargando totales históricos:', error);
      setTotalsHistoric({ revenue: 0, cost: 0, profit: 0 });
      setTotalsHistoricPartial(false);
      setHistoricDocsRead(0);
    } finally {
      setLoading(false);
    }
  };

  // formatea números a string local con 2 decimales
  const formatMoney = (value) => {
    try {
      return Number(value).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (e) {
      return Number(value || 0).toFixed(2);
    }
  };

  // Carga inicial de totales históricos
  useEffect(() => {
    fetchHistoricTotals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // compute filtered rows by minQty and any other client-side filters
  const filteredRows = useMemo(() => {
    const min = Number(minQty || 0);
    return rows.filter(r => (Number(r.qty || 0) >= min));
  }, [rows, minQty]);

  // pagination: derive current page rows
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  // ensure page in bounds
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const exportCsv = () => {
    // export filtered rows (no pagination) so CSV contains all matching data
    const filtered = filteredRows;
    if (filtered.length === 0) return;
    const header = ['orderId','date','productId','productName','qty','price','purchaseCost','revenue','cost','profit'];
    const lines = [header.join(',')];
    filtered.forEach(r => {
      const escaped = [r.orderId, r.date, r.productId, `"${(r.productName||'').replace(/"/g,'""')}"`, r.qty, Number(r.price).toFixed(2), Number(r.purchaseCost).toFixed(2), Number(r.revenue).toFixed(2), Number(r.cost).toFixed(2), Number(r.profit).toFixed(2)];
      lines.push(escaped.join(','));
    });

    const csvContent = '\uFEFF' + lines.join('\n'); // BOM for Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reportes_${fromDate || 'all'}_${toDate || 'all'}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-sm text-gray-600">Filtra por fecha y exporta en CSV</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm">Desde</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border px-3 py-2 rounded w-full sm:w-auto" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm">Hasta</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border px-3 py-2 rounded w-full sm:w-auto" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={fetchPeriodData} className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 w-full sm:w-auto">Filtrar</button>
            <button onClick={exportCsv} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto" disabled={rows.length===0}>Exportar CSV</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {/* KPI summary */}
        <div className="mb-4 grid grid-cols-1 gap-3 items-center">
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm text-gray-500">Ganancia del periodo</h2>
              <div className="text-xl font-bold text-green-700">Bs. {formatMoney(totals.profit)}</div>
              <div className="text-xs text-gray-500 mt-1">(Ingresos: Bs. {formatMoney(totals.revenue)} • Costo: Bs. {formatMoney(totals.cost)})</div>
            </div>
            <div>
              <h2 className="text-sm text-gray-500">Ganancia total histórico</h2>
              <div className="text-xl font-bold text-indigo-700">Bs. {formatMoney(totalsHistoric.profit)}</div>
              <div className="text-xs text-gray-500 mt-1">(Ingresos: Bs. {formatMoney(totalsHistoric.revenue)} • Costo: Bs. {formatMoney(totalsHistoric.cost)})</div>
              {totalsHistoricPartial && (
                <div className="mt-2 text-xs text-yellow-700">Totales parciales: se leyeron {historicDocsRead} documentos (límite aplicado). Para totales completos considere pre-aggregar en backend o aumentar el límite.</div>
              )}
            </div>

              {/* Confirm modal for full totals */}
              <ConfirmModal
                open={showFullConfirm}
                title="Calcular totales completos"
                message={"Esto leerá todas las órdenes y puede tardar o consumir muchos lecturas en Firestore. ¿Deseas continuar?"}
                onConfirm={() => { setShowFullConfirm(false); fetchHistoricTotals(true); }}
                onCancel={() => setShowFullConfirm(false)}
              />
          </div>
          <div className="flex flex-col sm:flex-col items-stretch sm:items-end gap-2">
            <button onClick={() => { fetchHistoricTotals(); if (fromDate || toDate) fetchPeriodData(); }} className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700">Refrescar</button>
            <button onClick={() => setShowFullConfirm(true)} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Calcular totales completos</button>
            <button onClick={exportCsv} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={rows.length===0}>Exportar CSV</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No se encontraron registros para el rango seleccionado.</div>
        ) : (
          <>
            <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-sm text-gray-700">Totales: Ingresos Bs. {totals.revenue.toFixed(2)} • Costo Bs. {totals.cost.toFixed(2)} • Ganancia Bs. {totals.profit.toFixed(2)}</div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <label className="text-sm">Filtro min. cantidad</label>
                  <input type="number" min={0} value={minQty} onChange={e => { setMinQty(Number(e.target.value || 0)); setPage(1); }} className="border px-3 py-2 rounded w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm">Tamaño página</label>
                  <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="border px-3 py-2 rounded">
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile: cards */}
            <div className="md:hidden space-y-3 mb-4">
              {paginatedRows.map((r, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold">{r.productName || r.productId}</div>
                      <div className="text-xs text-gray-500 mt-1">Pedido: <button onClick={() => {
                        const grouped = filteredRows.filter(rr => rr.orderId === r.orderId);
                        const revenue = grouped.reduce((s, it) => s + Number(it.revenue || 0), 0);
                        const cost = grouped.reduce((s, it) => s + Number(it.cost || 0), 0);
                        setSelectedOrderRows(grouped);
                        setSelectedOrderTotals({ revenue, cost, profit: revenue - cost });
                        setSelectedOrderId(r.orderId);
                      }} className="text-cyan-600 hover:underline">{r.orderId}</button></div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">Bs. {formatMoney(r.revenue)}</div>
                      <div className="text-xs text-gray-500">Costo: Bs. {formatMoney(r.cost)}</div>
                      <div className={`text-sm font-semibold ${r.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>Bs. {formatMoney(r.profit)}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
                    <div>Cant: {r.qty}</div>
                    <div>{r.date ? new Date(r.date).toLocaleString() : ''}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-2 py-2">Fecha</th>
                    <th className="px-2 py-2">Pedido</th>
                    <th className="px-2 py-2">Producto</th>
                    <th className="px-2 py-2">Nombre</th>
                    <th className="px-2 py-2">Cant.</th>
                    <th className="px-2 py-2">Precio</th>
                    <th className="px-2 py-2">Costo</th>
                    <th className="px-2 py-2">Gan.</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((r, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-2 py-2">{r.date ? new Date(r.date).toLocaleString() : ''}</td>
                      <td className="px-2 py-2">
                        <button onClick={() => {
                          // open modal with order details
                          const grouped = filteredRows.filter(rr => rr.orderId === r.orderId);
                          const revenue = grouped.reduce((s, it) => s + Number(it.revenue || 0), 0);
                          const cost = grouped.reduce((s, it) => s + Number(it.cost || 0), 0);
                          setSelectedOrderRows(grouped);
                          setSelectedOrderTotals({ revenue, cost, profit: revenue - cost });
                          setSelectedOrderId(r.orderId);
                        }} className="text-cyan-600 hover:underline">{r.orderId}</button>
                      </td>
                      <td className="px-2 py-2">{r.productId}</td>
                      <td className="px-2 py-2">{r.productName}</td>
                      <td className="px-2 py-2">{r.qty}</td>
                      <td className="px-2 py-2">Bs. {formatMoney(r.price)}</td>
                      <td className="px-2 py-2">Bs. {formatMoney(r.purchaseCost)}</td>
                      <td className="px-2 py-2">Bs. {formatMoney(r.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* pagination controls */}
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm text-gray-600">Mostrando {Math.min(filteredRows.length, (page-1)*pageSize+1)}-{Math.min(filteredRows.length, page*pageSize)} de {filteredRows.length} registros</div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setPage(p => Math.max(1, p-1))} className="px-2 py-1 border rounded" disabled={page===1}>Prev</button>
                  <div className="px-3 py-1 border rounded">{page} / {totalPages}</div>
                  <button onClick={() => setPage(p => Math.min(totalPages, p+1))} className="px-2 py-1 border rounded" disabled={page===totalPages}>Next</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Order detail modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-lg sm:rounded-lg p-4 w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Detalle Pedido: {selectedOrderId}</h3>
              <button onClick={() => { setSelectedOrderId(null); setSelectedOrderRows([]); }} className="text-gray-500 hover:text-gray-700">Cerrar</button>
            </div>

            <div className="mb-2 text-sm text-gray-700">Totales: Ingresos Bs. {selectedOrderTotals.revenue.toFixed(2)} • Costo Bs. {selectedOrderTotals.cost.toFixed(2)} • Ganancia Bs. {selectedOrderTotals.profit.toFixed(2)}</div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-2 py-2">Producto</th>
                    <th className="px-2 py-2">Cant.</th>
                    <th className="px-2 py-2">Precio</th>
                    <th className="px-2 py-2">Costo</th>
                    <th className="px-2 py-2">Gan.</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrderRows.map((it, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-2">{it.productName || it.productId}</td>
                      <td className="px-2 py-2">{it.qty}</td>
                      <td className="px-2 py-2">Bs. {it.price.toFixed(2)}</td>
                      <td className="px-2 py-2">Bs. {it.purchaseCost.toFixed(2)}</td>
                      <td className="px-2 py-2">Bs. {it.profit.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
