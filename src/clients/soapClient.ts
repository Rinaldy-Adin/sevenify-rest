import { SoapClient, createClientAsync } from '@/common/interfaces/soap';
import config from '@/config';

let soapClient: SoapClient | null = null;

export default async function getSoapClient() {
    if (soapClient == null) {
        soapClient = await createClientAsync(config.soapUrl);
        soapClient.addSoapHeader({ 'tns:apikey': config.soapApiKey });
    }
    return soapClient;
}
