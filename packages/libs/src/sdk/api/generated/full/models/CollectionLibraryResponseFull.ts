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
import type { CollectionActivityFull } from './CollectionActivityFull';
import {
    CollectionActivityFullFromJSON,
    CollectionActivityFullFromJSONTyped,
    CollectionActivityFullToJSON,
} from './CollectionActivityFull';
import type { VersionMetadata } from './VersionMetadata';
import {
    VersionMetadataFromJSON,
    VersionMetadataFromJSONTyped,
    VersionMetadataToJSON,
} from './VersionMetadata';

/**
 * 
 * @export
 * @interface CollectionLibraryResponseFull
 */
export interface CollectionLibraryResponseFull {
    /**
     * 
     * @type {number}
     * @memberof CollectionLibraryResponseFull
     */
    latestChainBlock: number;
    /**
     * 
     * @type {number}
     * @memberof CollectionLibraryResponseFull
     */
    latestIndexedBlock: number;
    /**
     * 
     * @type {number}
     * @memberof CollectionLibraryResponseFull
     */
    latestChainSlotPlays: number;
    /**
     * 
     * @type {number}
     * @memberof CollectionLibraryResponseFull
     */
    latestIndexedSlotPlays: number;
    /**
     * 
     * @type {string}
     * @memberof CollectionLibraryResponseFull
     */
    signature: string;
    /**
     * 
     * @type {string}
     * @memberof CollectionLibraryResponseFull
     */
    timestamp: string;
    /**
     * 
     * @type {VersionMetadata}
     * @memberof CollectionLibraryResponseFull
     */
    version: VersionMetadata;
    /**
     * 
     * @type {Array<CollectionActivityFull>}
     * @memberof CollectionLibraryResponseFull
     */
    data?: Array<CollectionActivityFull>;
}

/**
 * Check if a given object implements the CollectionLibraryResponseFull interface.
 */
export function instanceOfCollectionLibraryResponseFull(value: object): boolean {
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

export function CollectionLibraryResponseFullFromJSON(json: any): CollectionLibraryResponseFull {
    return CollectionLibraryResponseFullFromJSONTyped(json, false);
}

export function CollectionLibraryResponseFullFromJSONTyped(json: any, ignoreDiscriminator: boolean): CollectionLibraryResponseFull {
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
        'data': !exists(json, 'data') ? undefined : ((json['data'] as Array<any>).map(CollectionActivityFullFromJSON)),
    };
}

export function CollectionLibraryResponseFullToJSON(value?: CollectionLibraryResponseFull | null): any {
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
        'data': value.data === undefined ? undefined : ((value.data as Array<any>).map(CollectionActivityFullToJSON)),
    };
}
