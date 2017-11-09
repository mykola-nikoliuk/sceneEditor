import io from 'socket.io-client';
import config from 'config.json';

const {connection: {host, port}} = config;

export const connection = io(`${host}:${port}`);
