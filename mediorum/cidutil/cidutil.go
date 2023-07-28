package cidutil

import (
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"

	"github.com/ipfs/go-cid"
	"github.com/multiformats/go-multihash"
)

func ComputeFileHeaderCID(fh *multipart.FileHeader) (string, error) {
	f, err := fh.Open()
	if err != nil {
		return "", err
	}
	defer f.Close()
	return ComputeFileCID(f)
}

func ComputeFileCID(f io.ReadSeeker) (string, error) {
	defer f.Seek(0, 0)
	builder := cid.V1Builder{}
	hash, err := multihash.SumStream(f, multihash.SHA2_256, -1)
	if err != nil {
		return "", err
	}
	cid, err := builder.Sum(hash)
	if err != nil {
		return "", err
	}
	return cid.String(), nil
}

// note: any Qm CID will be invalid because its hash won't match the contents
func ValidateCID(expectedCID string, f io.ReadSeeker) error {
	computed, err := ComputeFileCID(f)
	if err != nil {
		return err
	}
	if computed != expectedCID {
		return fmt.Errorf("expected cid: %s but contents hashed to %s", expectedCID, computed)
	}
	return nil
}

func IsLegacyCID(cid string) bool {
	return len(cid) == 46 && cid[:2] == "Qm"
}

// Returns a sharded filepath/key for CID based on CID version.
// V0: last 3 chars, offset by 1
// V1: last 5 chars
func ShardCID(cidStr string) string {
	if IsLegacyCID(cidStr) {
		return shardLegacyCID(cidStr)
	}
	return shardCIDV1(cidStr)
}

// Returns sharded filepath for CID V0. Ex: returns "QuP/QmY7Yh4UquoXHLPFo2XbhXkhBvFoPwmQUSa92pxnxjQuPU" for "QmY7Yh4UquoXHLPFo2XbhXkhBvFoPwmQUSa92pxnxjQuPU"
func shardLegacyCID(cid string) string {
	shard := cid[len(cid)-4 : len(cid)-1]
	return filepath.Join(shard, cid)
}

// Returns sharded filepath for CID V1. Ex: returns "ru7u2/baeaaaiqsecffzabbj7utfkkmywbhlls46twtaq3fbvpbozvugl4bqszfru7u2" for "baeaaaiqsecffzabbj7utfkkmywbhlls46twtaq3fbvpbozvugl4bqszfru7u2"
func shardCIDV1(cid string) string {
	// it would technically be more correct to parse CID and then do `cid.Hash().HexString()[0:5]`, but this way is easier to calculate filepath manually given a CID
	shard := cid[len(cid)-5:]
	return filepath.Join(shard, cid)
}