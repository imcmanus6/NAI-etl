/**
 * @etl/connectors — concrete connectors + registry wiring.
 *
 * MVP connectors: postgres, mysql, csv, json. Register more here as they are
 * implemented against the @etl/connector-sdk interface.
 */
import { ConnectorRegistry, type Connector } from '@etl/connector-sdk';
import { CsvConnector } from './csv.js';
import { JsonConnector } from './json.js';
import { MysqlConnector } from './mysql.js';
import { PostgresConnector } from './postgres.js';

export { CsvConnector, JsonConnector, MysqlConnector, PostgresConnector };

/** Build a registry populated with all MVP connectors. */
export function createConnectorRegistry(): ConnectorRegistry {
  const registry = new ConnectorRegistry();
  const connectors: Connector[] = [
    new PostgresConnector(),
    new MysqlConnector(),
    new CsvConnector(),
    new JsonConnector(),
  ];
  for (const c of connectors) {
    registry.register({ type: c.type, create: () => c });
  }
  return registry;
}
