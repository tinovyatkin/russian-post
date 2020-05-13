/* eslint-disable @typescript-eslint/no-empty-interface */
import { soap } from 'strong-soap';
import { promisify } from 'util';

import { deepObjectToCamelCase } from './lib/deep-object-to-camel-case';

const createClient = promisify(soap.createClient);

const RUSSIAN_POST_SINGLE_WSDL = 'https://tracking.russianpost.ru/rtm34?wsdl';
// const RUSSIAN_POST_BATCH_WSDL = 'https://tracking.russianpost.ru/fc?wsdl';

let trackingSingleClient: { getOperationHistory: Function };

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

async function getHistory(params: HistoryArguments): Promise<TrackingResult> {
  if (!trackingSingleClient) {
    trackingSingleClient = await createClient(RUSSIAN_POST_SINGLE_WSDL);
  }
  if (!getOperationHistory) {
    getOperationHistory = promisify(
      trackingSingleClient.getOperationHistory,
    ) as (args: OperationHistoryParams) => Promise<unknown>;
  }

  let history;
  try {
    history = (await getOperationHistory({
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
      OperationHistoryData: {
        historyRecord: unknown[];
      };
    };
  } catch (err) {
    // we will cleanup error message for Soap errors
    // it's like this:
    // " Code: {"Value":"S:Receiver"} Reason: {"Text":{"$attributes":{"lang":"en"},"$value":"Error"}} Detail: {"OperationHistoryFaultReason":"The format of the request data is invalid"}"
    // looks like incomplete JSON
    try {
      const faultReason = /{\s*"OperationHistoryFaultReason"\s*:\s*"(?<reason>[^"]+)"\s*}/.exec(
        err.message,
      )?.groups?.reason;
      if (faultReason) err.message = faultReason;
    } catch {}
    throw err;
  }

  // if tracking code is formatted correctly, but non existent then API will return
  // {OperationHistoryData: undefined}
  // let's throw more prominent error in this case
  if (history && !history.OperationHistoryData)
    throw new ReferenceError(
      `Unable to find operations history for tracking code "${params.barCode}"`,
    );

  // let's transform keys AddressParameters, FinanceParameters, etc -> address, finance
  const result = history.OperationHistoryData.historyRecord.map(record =>
    deepObjectToCamelCase(record as Record<string, unknown>, /Parameters$/),
  );

  return result as TrackingResult;
}

export class Tracking {
  private readonly login: string;
  private readonly password: string;
  private readonly language: SupportedLanguage = 'RUS';
  private readonly messageType: MessageType = 0;
  constructor(params: Partial<Omit<HistoryArguments, 'barCode'>>) {
    const login = params.login || process.env.RUSSIAN_POST_LOGIN;
    if (!login)
      throw new Error(
        'You must specify Russian Post API login either at construction parameters or via RUSSIAN_POST_LOGIN environment variable',
      );
    this.login = login;
    const password = params.password || process.env.RUSSIAN_POST_PASSWORD;
    if (!password)
      throw new Error(
        'You must specify Russian Post API password either at construction parameters or via RUSSIAN_POST_PASSWORD environment variable',
      );
    this.password = password;

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

/**
 * Codes of operations types that considered final operations
 * operType -> operAttr[]
 * @see {@link https://tracking.pochta.ru/support/dictionaries/operation_codes}
 */
export const FinalOperations: Map<number, number[] | undefined> = new Map([
  // delivery
  [2, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]],
  // Failure to deliver
  [5, [1, 2]],
  // 	Handed over for temporary storage
  [15, undefined],
  // Destruction
  [16, undefined],
  // Registration of property rights
  [17, undefined],
  // Registration of the loss
  [18, undefined],
]);
