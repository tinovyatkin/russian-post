import { soap } from 'strong-soap';
import { promisify, inspect } from 'util';
import { camelCase } from 'camel-case';
import objectToCamelCase from 'object-to-camel-case';

const createClient = promisify(soap.createClient);

const RUSSIAN_POST_WSDL = 'https://tracking.russianpost.ru/rtm34?wsdl';

let trackingClient: { getOperationHistory: Function };

interface OperationHistoryParams {}

let getOperationHistory: (args: OperationHistoryParams) => Promise<unknown>;

type SupportedLanguage = 'RUS' | 'ENG';
type MessageType = 0 | 1;
interface HistoryArguments {
  barCode: string;
  login: string;
  password: string;
  messageType?: MessageType;
  language?: SupportedLanguage;
}

interface TrackingResult {}

function deepObjectToCamelCase(o: unknown) {
  const res = objectToCamelCase(o);
  for (const [key, value] of Object.entries(res)) {
    if (typeof value === 'object') res[key] = objectToCamelCase(value);
  }
  return res;
}

async function getHistory(params: HistoryArguments): Promise<TrackingResult> {
  if (!trackingClient) {
    trackingClient = await createClient(RUSSIAN_POST_WSDL);
  }
  if (!getOperationHistory) {
    getOperationHistory = promisify(trackingClient.getOperationHistory) as (
      args: OperationHistoryParams,
    ) => Promise<unknown>;
  }

  const history = (await getOperationHistory({
    OperationHistoryRequest: {
      Barcode: params.barCode,
      MessageType: params.messageType || 0,
      Language: params.language || 'RUS',
    },
    AuthorizationHeader: {
      login: params.login,
      password: params.password,
    },
  })) as {
    OperationHistoryData: { historyRecord: unknown[] };
  };

  // let's transform keys AddressParameters, FinanceParameters, etc -> address, finance
  const result = history.OperationHistoryData.historyRecord.map(record => {
    const entry: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      record as Record<string, unknown>,
    )) {
      entry[camelCase(key.replace(/Parameters$/, ''))] = deepObjectToCamelCase(
        value,
      );
    }
    return entry;
  });

  console.log(inspect(result, false, 5, true));
  return result as TrackingResult;
}

export class Tracking {
  private readonly login: string;
  private readonly password: string;
  private readonly language: SupportedLanguage = 'RUS';
  private readonly messageType: MessageType = 0;
  constructor(params: Omit<HistoryArguments, 'barCode'>) {
    this.login = params.login;
    this.password = params.password;
    if (params.language) this.language = params.language;
    if (typeof params.messageType === 'number')
      this.messageType = params.messageType;
  }

  getHistory(
    barCode: string,
    language: SupportedLanguage = this.language,
    messageType?: MessageType,
  ): Promise<TrackingResult> {
    return getHistory({
      barCode,
      language: language || this.language,
      messageType: messageType ?? this.messageType,
      login: this.login,
      password: this.password,
    });
  }
}

const tracking = new Tracking({
  login: 'DkMRhUOMHzyLRl',
  password: 'zKjyRE5TXsBy',
});
tracking.getHistory('RS253346199NL');
