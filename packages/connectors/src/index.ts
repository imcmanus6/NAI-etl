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
import { FixedWidthConnector } from './fixedwidth.js';
import { XmlConnector } from './xml.js';
import { Hl7Connector } from './hl7.js';

export { CsvConnector, JsonConnector, MysqlConnector, PostgresConnector, FixedWidthConnector, XmlConnector, Hl7Connector };
export { parseHl7, extractMedent, buildHl7Schema, type MedentRecords, type Hl7Message } from './hl7.js';

/** Build a registry populated with all MVP connectors. */
export function createConnectorRegistry(): ConnectorRegistry {
  const registry = new ConnectorRegistry();
  const csv = new CsvConnector();
  const connectors: Connector[] = [
    new PostgresConnector(),
    new MysqlConnector(),
    csv,
    new JsonConnector(),
    new FixedWidthConnector(),
    new XmlConnector(),
    new Hl7Connector(),
  ];
  for (const c of connectors) {
    registry.register({ type: c.type, create: () => c });
  }
  // Delimited files share the CSV connector (with an explicit `delimiter`).
  registry.register({ type: 'delimited', create: () => csv });
  return registry;
}
