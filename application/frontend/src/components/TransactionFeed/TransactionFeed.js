import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Box, Chip,
  List, ListItem, ListItemText, Divider, CircularProgress
} from '@mui/material';
import apiService from '../../services/apiService';
import websocketService from '../../services/websocketService';
import './TransactionFeed.css';

const TransactionFeed = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
    websocketService.connect();

    websocketService.on('transaction', handleNewTransaction);

    return () => {
      websocketService.off('transaction', handleNewTransaction);
    };
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await apiService.getTransactions(100);
      setTransactions(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setLoading(false);
    }
  };

  const handleNewTransaction = (data) => {
    setTransactions(prev => [data, ...prev].slice(0, 100));
  };

  const getChannelColor = (channel) => {
    switch (channel?.toLowerCase()) {
      case 'city-traffic-global': return 'primary';
      case 'emergency-ops': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'invoke': return 'success';
      case 'query': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="transaction-feed">
      <Typography variant="h4" gutterBottom className="feed-title">
        Transaction Feed
      </Typography>

      <Card className="feed-card">
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Recent Transactions ({transactions.length})
            </Typography>
            <Chip label="Live" color="success" size="small" />
          </Box>

          <List className="transaction-list">
            {transactions.length === 0 ? (
              <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                No transactions yet
              </Typography>
            ) : (
              transactions.map((tx, index) => (
                <React.Fragment key={tx.txId || index}>
                  <ListItem className="transaction-item">
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography variant="subtitle2" className="tx-id">
                            {tx.txId ? tx.txId.substring(0, 16) + '...' : 'Unknown TxID'}
                          </Typography>
                          <Chip
                            label={tx.channel || 'Unknown'}
                            color={getChannelColor(tx.channel)}
                            size="small"
                          />
                          <Chip
                            label={tx.type || 'Unknown'}
                            color={getTypeColor(tx.type)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box mt={1}>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Chaincode:</strong> {tx.chaincode || 'Unknown'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Function:</strong> {tx.function || 'Unknown'}
                          </Typography>
                          {tx.args && tx.args.length > 0 && (
                            <Typography variant="body2" color="textSecondary">
                              <strong>Args:</strong> {tx.args.join(', ')}
                            </Typography>
                          )}
                          <Typography variant="caption" color="textSecondary">
                            {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'Unknown time'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < transactions.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </List>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionFeed;
