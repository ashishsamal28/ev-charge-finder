import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Zap, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { adminApi, stationApi } from '../../services/api';
import AdminNav from '../../components/admin/AdminNav';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminChargersPage() {
  const [chargers, setChargers] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modal State for Add / Edit Charger
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCharger, setEditingCharger] = useState(null);
  const [chargerForm, setChargerForm] = useState({
    station_id: '',
    charger_code: '',
    connector_type: 'CCS2',
    charging_power_kw: 60,
    price_per_kwh: 16.0,
    operational_status: 'Available',
    is_active: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const [chargersRes, stationsRes] = await Promise.all([
        adminApi.getChargers(selectedStationId ? parseInt(selectedStationId, 10) : null),
        adminApi.getStations({ limit: 100 })
      ]);
      setChargers(chargersRes.data || []);
      setStations(stationsRes.data || []);
      if (!chargerForm.station_id && stationsRes.data?.length > 0) {
        setChargerForm((prev) => ({ ...prev, station_id: stationsRes.data[0].id }));
      }
    } catch (err) {
      setActionError(err.message || 'Failed to load chargers');
    } finally {
      setLoading(false);
    }
  }, [selectedStationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingCharger(null);
    setChargerForm({
      station_id: selectedStationId || (stations[0]?.id || ''),
      charger_code: '',
      connector_type: 'CCS2',
      charging_power_kw: 60,
      price_per_kwh: 16.0,
      operational_status: 'Available',
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCharger(c);
    setChargerForm({
      station_id: c.station_id,
      charger_code: c.charger_code,
      connector_type: c.connector_type,
      charging_power_kw: c.charging_power_kw,
      price_per_kwh: c.price_per_kwh,
      operational_status: c.operational_status,
      is_active: c.is_active,
    });
    setModalOpen(true);
  };

  const handleSaveCharger = async (e) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    try {
      if (editingCharger) {
        await adminApi.updateCharger(editingCharger.id, chargerForm);
        setActionSuccess(`Charger bay ${chargerForm.charger_code} updated successfully.`);
      } else {
        await adminApi.createCharger(chargerForm);
        setActionSuccess(`Charger bay ${chargerForm.charger_code} created successfully.`);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to save charger.');
    }
  };

  const handleDeleteCharger = async (c) => {
    if (!window.confirm(`Are you sure you want to delete charger ${c.charger_code}?`)) {
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    try {
      await adminApi.deleteCharger(c.id);
      setActionSuccess(`Charger ${c.charger_code} deleted.`);
      loadData();
    } catch (err) {
      setActionError(err.message || 'Cannot delete charger.');
    }
  };

  const handleStatusChange = async (charger, newStatus) => {
    try {
      await adminApi.toggleChargerStatus(charger.id, { operational_status: newStatus });
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to update bay status.');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem 5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)' }}>
            Charger Bay Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Monitor and configure connector types, power ratings, tariffs, and maintenance states.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={18} /> Add Charger Bay
        </button>
      </div>

      <AdminNav />

      {/* Notifications */}
      {actionSuccess && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#DCFCE7', color: '#166534', borderRadius: 'var(--radius)', marginBottom: '1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {actionSuccess}
        </div>
      )}

      {actionError && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEE2E2', color: 'var(--error)', borderRadius: 'var(--radius)', marginBottom: '1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> {actionError}
        </div>
      )}

      {/* Station Selector Filter */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)' }}>
          Filter by Station:
        </span>
        <select
          value={selectedStationId}
          onChange={(e) => setSelectedStationId(e.target.value)}
          className="form-select"
          style={{ maxWidth: 360 }}
        >
          <option value="">All Stations ({chargers.length} total bays)</option>
          {stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.city})
            </option>
          ))}
        </select>
      </div>

      {/* Chargers Table */}
      <div className="card" style={{ padding: '1rem', overflowX: 'auto' }}>
        {loading ? (
          <LoadingSpinner message="Loading charger bays..." />
        ) : chargers.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Bay Code</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Station</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Connector</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Power (kW)</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Tariff Rate</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Operational Status</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {chargers.map((c) => {
                const station = stations.find((s) => s.id === c.station_id);

                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, color: 'var(--navy)' }}>
                      {c.charger_code}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {station?.name || `Station #${c.station_id}`}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className="badge badge-neutral">{c.connector_type}</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                      {c.charging_power_kw} kW
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                      ₹{c.price_per_kwh.toFixed(1)} / kWh
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <select
                        value={c.operational_status}
                        onChange={(e) => handleStatusChange(c, e.target.value)}
                        className="form-select"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                      >
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Out of Service">Out of Service</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          onClick={() => openEditModal(c)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.35rem 0.6rem' }}
                          title="Edit charger bay"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCharger(c)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.35rem 0.6rem' }}
                          title="Delete charger bay safely"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
            No charger bays found for this selection.
          </p>
        )}
      </div>

      {/* CREATE / EDIT CHARGER MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy)' }}>
                {editingCharger ? `Edit Bay ${editingCharger.charger_code}` : 'Add New Charger Bay'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCharger}>
              <div className="form-group">
                <label className="form-label">Station *</label>
                <select
                  disabled={Boolean(editingCharger)}
                  value={chargerForm.station_id}
                  onChange={(e) => setChargerForm({ ...chargerForm, station_id: parseInt(e.target.value, 10) })}
                  className="form-select"
                  required
                >
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Bay Code *</label>
                <input
                  type="text"
                  required
                  value={chargerForm.charger_code}
                  onChange={(e) => setChargerForm({ ...chargerForm, charger_code: e.target.value })}
                  placeholder="e.g. CP-DC-03"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Connector Type</label>
                  <select
                    value={chargerForm.connector_type}
                    onChange={(e) => setChargerForm({ ...chargerForm, connector_type: e.target.value })}
                    className="form-select"
                  >
                    <option value="CCS2">CCS2 (DC Fast)</option>
                    <option value="Type 2">Type 2 (AC)</option>
                    <option value="CHAdeMO">CHAdeMO (DC)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Power (kW) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    value={chargerForm.charging_power_kw}
                    onChange={(e) => setChargerForm({ ...chargerForm, charging_power_kw: parseFloat(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Tariff (₹ / kWh) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="0"
                    value={chargerForm.price_per_kwh}
                    onChange={(e) => setChargerForm({ ...chargerForm, price_per_kwh: parseFloat(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={chargerForm.operational_status}
                    onChange={(e) => setChargerForm({ ...chargerForm, operational_status: e.target.value })}
                    className="form-select"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Bay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
