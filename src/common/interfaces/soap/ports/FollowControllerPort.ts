import { Tnsaccept } from "../definitions/Tnsaccept";
import { TnsacceptResponse } from "../definitions/TnsacceptResponse";
import { Tnsunfollow } from "../definitions/Tnsunfollow";
import { TnsunfollowResponse } from "../definitions/TnsunfollowResponse";
import { Tnsfollow } from "../definitions/Tnsfollow";
import { TnsfollowResponse } from "../definitions/TnsfollowResponse";
import { Tnshealth } from "../definitions/Tnshealth";
import { TnshealthResponse } from "../definitions/TnshealthResponse";
import { Tnsreject } from "../definitions/Tnsreject";
import { TnsrejectResponse } from "../definitions/TnsrejectResponse";
import { TnsgetPendingFollowerIds } from "../definitions/TnsgetPendingFollowerIds";
import { TnsgetPendingFollowerIdsResponse } from "../definitions/TnsgetPendingFollowerIdsResponse";
import { TnsgetCurrentFollowerIds } from "../definitions/TnsgetCurrentFollowerIds";
import { TnsgetCurrentFollowerIdsResponse } from "../definitions/TnsgetCurrentFollowerIdsResponse";

export interface FollowControllerPort {
    accept(accept: Tnsaccept, callback: (err: any, result: TnsacceptResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    unfollow(unfollow: Tnsunfollow, callback: (err: any, result: TnsunfollowResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    follow(follow: Tnsfollow, callback: (err: any, result: TnsfollowResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    health(health: Tnshealth, callback: (err: any, result: TnshealthResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    reject(reject: Tnsreject, callback: (err: any, result: TnsrejectResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    getPendingFollowerIds(getPendingFollowerIds: TnsgetPendingFollowerIds, callback: (err: any, result: TnsgetPendingFollowerIdsResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    getCurrentFollowerIds(getCurrentFollowerIds: TnsgetCurrentFollowerIds, callback: (err: any, result: TnsgetCurrentFollowerIdsResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}
