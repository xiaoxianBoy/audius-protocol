/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
/**
 * API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { ActivityFull } from './ActivityFull';
import {
    ActivityFullFromJSON,
    ActivityFullFromJSONTyped,
    ActivityFullToJSON,
} from './ActivityFull';
import type { VersionMetadata } from './VersionMetadata';
import {
    VersionMetadataFromJSON,
    VersionMetadataFromJSONTyped,
    VersionMetadataToJSON,
} from './VersionMetadata';

/**
 * 
 * @export
 * @interface HistoryResponseFull
 */
export interface HistoryResponseFull {
    /**
     * 
     * @type {number}
     * @memberof HistoryResponseFull
     */
    latestChainBlock: number;
    /**
     * 
     * @type {number}
     * @memberof HistoryResponseFull
     */
    latestIndexedBlock: number;
    /**
     * 
     * @type {number}
     * @memberof HistoryResponseFull
     */
    latestChainSlotPlays: number;
    /**
     * 
     * @type {number}
     * @memberof HistoryResponseFull
     */
    latestIndexedSlotPlays: number;
    /**
     * 
     * @type {string}
     * @memberof HistoryResponseFull
     */
    signature: string;
    /**
     * 
     * @type {string}
     * @memberof HistoryResponseFull
     */
    timestamp: string;
    /**
     * 
     * @type {VersionMetadata}
     * @memberof HistoryResponseFull
     */
    version: VersionMetadata;
    /**
     * 
     * @type {Array<ActivityFull>}
     * @memberof HistoryResponseFull
     */
    data?: Array<ActivityFull>;
}

/**
 * Check if a given object implements the HistoryResponseFull interface.
 */
export function instanceOfHistoryResponseFull(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "latestChainBlock" in value;
    isInstance = isInstance && "latestIndexedBlock" in value;
    isInstance = isInstance && "latestChainSlotPlays" in value;
    isInstance = isInstance && "latestIndexedSlotPlays" in value;
    isInstance = isInstance && "signature" in value;
    isInstance = isInstance && "timestamp" in value;
    isInstance = isInstance && "version" in value;

    return isInstance;
}

export function HistoryResponseFullFromJSON(json: any): HistoryResponseFull {
    return HistoryResponseFullFromJSONTyped(json, false);
}

export function HistoryResponseFullFromJSONTyped(json: any, ignoreDiscriminator: boolean): HistoryResponseFull {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'latestChainBlock': json['latest_chain_block'],
        'latestIndexedBlock': json['latest_indexed_block'],
        'latestChainSlotPlays': json['latest_chain_slot_plays'],
        'latestIndexedSlotPlays': json['latest_indexed_slot_plays'],
        'signature': json['signature'],
        'timestamp': json['timestamp'],
        'version': VersionMetadataFromJSON(json['version']),
        'data': !exists(json, 'data') ? undefined : ((json['data'] as Array<any>).map(ActivityFullFromJSON)),
    };
}

export function HistoryResponseFullToJSON(value?: HistoryResponseFull | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'latest_chain_block': value.latestChainBlock,
        'latest_indexed_block': value.latestIndexedBlock,
        'latest_chain_slot_plays': value.latestChainSlotPlays,
        'latest_indexed_slot_plays': value.latestIndexedSlotPlays,
        'signature': value.signature,
        'timestamp': value.timestamp,
        'version': VersionMetadataToJSON(value.version),
        'data': value.data === undefined ? undefined : ((value.data as Array<any>).map(ActivityFullToJSON)),
    };
}
