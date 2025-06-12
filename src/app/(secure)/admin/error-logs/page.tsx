"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ErrorLog {
    _id: string;
    errorType: string;
    message: string;
    stack?: string;
    userId?: {
        _id: string;
        email: string;
        name: string;
    };
    userEmail: string;
    context?: any;
    metadata?: any;
    createdAt: string;
}

export default function ErrorLogsPage() {
    const { data: session } = useSession();
    const [logs, setLogs] = useState<ErrorLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
    const [filters, setFilters] = useState({
        limit: '50',
        hours: '24',
        errorType: '',
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.limit) params.set('limit', filters.limit);
            if (filters.hours) params.set('hours', filters.hours);
            if (filters.errorType) params.set('errorType', filters.errorType);

            const response = await fetch(`/api/admin/error-logs?${params}`);
            const data = await response.json();
            
            if (data.success) {
                setLogs(data.logs);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLogs();
    };

    if (!session) {
        return <div className="p-6">Please log in to view error logs.</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Error Logs</h1>
                <button
                    onClick={fetchLogs}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <form onSubmit={handleFilterSubmit} className="mb-6 p-4 bg-gray-100 rounded">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Limit</label>
                        <input
                            type="number"
                            value={filters.limit}
                            onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Hours (recent)</label>
                        <input
                            type="number"
                            value={filters.hours}
                            onChange={(e) => setFilters({ ...filters, hours: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Error Type</label>
                        <input
                            type="text"
                            value={filters.errorType}
                            onChange={(e) => setFilters({ ...filters, errorType: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="e.g., SUBSCRIPTION_UPGRADE_ERROR"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Apply Filters
                </button>
            </form>

            {loading ? (
                <div className="text-center">Loading...</div>
            ) : (
                <>
                    <div className="mb-4">
                        <span className="text-sm text-gray-600">
                            Showing {logs.length} error logs
                        </span>
                    </div>

                    {/* Error List */}
                    <div className="space-y-4">
                        {logs.map((log) => (
                            <div
                                key={log._id}
                                className="border rounded p-4 hover:bg-gray-50 cursor-pointer"
                                onClick={() => setSelectedLog(log)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-red-600">{log.errorType}</span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-700 mb-2">{log.message}</div>
                                <div className="text-xs text-gray-500">
                                    User: {log.userId?.email || log.userEmail || 'Unknown'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detail Modal */}
                    {selectedLog && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold">{selectedLog.errorType}</h2>
                                        <button
                                            onClick={() => setSelectedLog(null)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-semibold">Message:</h3>
                                            <p className="text-sm bg-gray-100 p-2 rounded">{selectedLog.message}</p>
                                        </div>
                                        
                                        {selectedLog.stack && (
                                            <div>
                                                <h3 className="font-semibold">Stack Trace:</h3>
                                                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{selectedLog.stack}</pre>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <h3 className="font-semibold">User:</h3>
                                            <p className="text-sm">{selectedLog.userId?.email || selectedLog.userEmail || 'Unknown'}</p>
                                        </div>
                                        
                                        <div>
                                            <h3 className="font-semibold">Timestamp:</h3>
                                            <p className="text-sm">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                                        </div>
                                        
                                        {selectedLog.context && (
                                            <div>
                                                <h3 className="font-semibold">Context:</h3>
                                                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                                    {JSON.stringify(selectedLog.context, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        
                                        {selectedLog.metadata && (
                                            <div>
                                                <h3 className="font-semibold">Metadata:</h3>
                                                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                                    {JSON.stringify(selectedLog.metadata, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
} 