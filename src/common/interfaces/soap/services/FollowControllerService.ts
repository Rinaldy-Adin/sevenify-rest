import { FollowControllerPort } from "../ports/FollowControllerPort";

export interface FollowControllerService {
    readonly FollowControllerPort: FollowControllerPort;
}
