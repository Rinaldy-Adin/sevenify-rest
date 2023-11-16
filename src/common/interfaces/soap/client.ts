import { Client, createClientAsync as soapCreateClientAsync } from "soap";
import { Tnsaccept } from "./definitions/Tnsaccept";
import { TnsacceptResponse } from "./definitions/TnsacceptResponse";
import { Tnsunfollow } from "./definitions/Tnsunfollow";
import { TnsunfollowResponse } from "./definitions/TnsunfollowResponse";
import { Tnsfollow } from "./definitions/Tnsfollow";
import { TnsfollowResponse } from "./definitions/TnsfollowResponse";
import { Tnshealth } from "./definitions/Tnshealth";
import { TnshealthResponse } from "./definitions/TnshealthResponse";
import { Tnsreject } from "./definitions/Tnsreject";
import { TnsrejectResponse } from "./definitions/TnsrejectResponse";
import { TnsgetPendingFollowerIds } from "./definitions/TnsgetPendingFollowerIds";
import { TnsgetPendingFollowerIdsResponse } from "./definitions/TnsgetPendingFollowerIdsResponse";
import { TnsgetCurrentFollowerIds } from "./definitions/TnsgetCurrentFollowerIds";
import { TnsgetCurrentFollowerIdsResponse } from "./definitions/TnsgetCurrentFollowerIdsResponse";
import { FollowControllerService } from "./services/FollowControllerService";

export interface SoapClient extends Client {
    FollowControllerService: FollowControllerService;
    acceptAsync(accept: Tnsaccept): Promise<[result: TnsacceptResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    unfollowAsync(unfollow: Tnsunfollow): Promise<[result: TnsunfollowResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    followAsync(follow: Tnsfollow): Promise<[result: TnsfollowResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    healthAsync(health: Tnshealth): Promise<[result: TnshealthResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    rejectAsync(reject: Tnsreject): Promise<[result: TnsrejectResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    getPendingFollowerIdsAsync(getPendingFollowerIds: TnsgetPendingFollowerIds): Promise<[result: TnsgetPendingFollowerIdsResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    getCurrentFollowerIdsAsync(getCurrentFollowerIds: TnsgetCurrentFollowerIds): Promise<[result: TnsgetCurrentFollowerIdsResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
}

/** Create SoapClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<SoapClient> {
    return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
