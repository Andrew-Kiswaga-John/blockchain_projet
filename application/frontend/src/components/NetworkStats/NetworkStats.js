import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Box, Grid, Chip,
  List, ListItem, ListItemText, CircularProgress, LinearProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import apiService from '../../services/apiService';
import websocketService from '../../services/websocketService';
import './NetworkStats.css';

const NetworkStats = () => {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blockHeight, setBlockHeight] = useState(0);

  useEffect(() => {
    loadNetworkInfo();
    websocketService.connect();

    websocketService.on('blockCommitted', handleBlockCommitted);

    const interval = setInterval(loadNetworkInfo, 20000);

    return () => {
      clearInterval(interval);
      websocketService.off('blockCommitted', handleBlockCommitted);
    };
  }, []);

  const loadNetworkInfo = async () => {
    try {
      const data = await apiService.getNetworkInfo();
      setNetworkInfo(data);
      if (data?.blockHeight) {
        setBlockHeight(data.blockHeight);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading network info:', error);
      setLoading(false);
    }
  };

  const handleBlockCommitted = (data) => {
    setBlockHeight(prev => prev + 1);
    loadNetworkInfo();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const channels = networkInfo?.channels || [];
  const peers = networkInfo?.peers || [];
  const orderers = networkInfo?.orderers || [];

  return (
    <div className="network-stats">
      <Typography variant="h4" gutterBottom className="stats-title">
        Network Statistics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card className="stats-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Network Overview
              </Typography>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Status:</strong>{' '}
                  <Chip
                    label={networkInfo?.status || 'Unknown'}
                    color={networkInfo?.status === 'healthy' ? 'success' : 'error'}
                    size="small"
                  />
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  <strong>Block Height:</strong> {blockHeight}
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  <strong>Channels:</strong> {channels.length}
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  <strong>Peers:</strong> {peers.length}
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  <strong>Orderers:</strong> {orderers.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card className="stats-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Channels
              </Typography>
              <List>
                {channels.length === 0 ? (
                  <Typography color="textSecondary" align="center">
                    No channels available
                  </Typography>
                ) : (
                  channels.map((channel, index) => (
                    <ListItem key={channel.name || index} divider>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1">
                              {channel.name || 'Unknown'}
                            </Typography>
                            <Chip
                              label={channel.consensus || 'RAFT'}
                              color="primary"
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box mt={1}>
                            <Typography variant="body2" color="textSecondary">
                              <strong>Block Height:</strong> {channel.height || 0}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              <strong>Organizations:</strong> {channel.organizations?.length || 0}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              <strong>Chaincodes:</strong> {channel.chaincodes?.length || 0}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="stats-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Peer Nodes
              </Typography>
              <List>
                {peers.length === 0 ? (
                  <Typography color="textSecondary" align="center">
                    No peers available
                  </Typography>
                ) : (
                  peers.map((peer, index) => (
                    <ListItem key={peer.name || index} divider>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            {peer.status === 'online' ? (
                              <CheckCircleIcon color="success" fontSize="small" />
                            ) : (
                              <ErrorIcon color="error" fontSize="small" />
                            )}
                            <Typography variant="subtitle2">
                              {peer.name || 'Unknown'}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="textSecondary">
                            {peer.organization || 'Unknown Org'} • {peer.url || 'No URL'}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="stats-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Orderer Nodes
              </Typography>
              <List>
                {orderers.length === 0 ? (
                  <Typography color="textSecondary" align="center">
                    No orderers available
                  </Typography>
                ) : (
                  orderers.map((orderer, index) => (
                    <ListItem key={orderer.name || index} divider>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            {orderer.status === 'online' ? (
                              <CheckCircleIcon color="success" fontSize="small" />
                            ) : (
                              <ErrorIcon color="error" fontSize="small" />
                            )}
                            <Typography variant="subtitle2">
                              {orderer.name || 'Unknown'}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="textSecondary">
                            {orderer.url || 'No URL'}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {networkInfo?.performance && (
          <Grid item xs={12}>
            <Card className="stats-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics
                </Typography>
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Transaction Throughput (TPS)
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((networkInfo.performance.tps / 100) * 100, 100)}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2">
                      {networkInfo.performance.tps || 0} TPS
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default NetworkStats;
