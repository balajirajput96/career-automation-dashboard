# Canonical Hindi Reel Production State

## Verified recovery point

The canonical Google Drive workspace is `3000_HINDI_RESEARCH_REELS` with root ID `1-sIkvOsLlfTCY4CPC0Cb1B6St72UrqFj`. Its active `Batch_001` folder is `1hz2gSOMAWzfG0_vasKunhxG8rhscD7U4`.

The verified checkpoint lineage now records **16** complete, read-back-verified Drive packages for Reels `0001` through `0016`. Reel 0016 is `QC_PASSED_AND_DRIVE_READBACK_VERIFIED`; its final video is Drive file `1PkT5UIwrgOZLNNzaibiVsnqdGGzWdZSY`, and its package folder is `1BbOyDg1cOr4V5R1V25jZ7FP6jAjqxsc6`.

The current resume authority is `checkpoint_after_reel_0016_schedule_20260825T123900Z.json` (Drive file `1w2nIxhysW8uPcvu8uSPBlxsHL964KwAT`). It instructs the pipeline to resume at **Reel 0017** in `Batch_001`. The preceding Reel 0016 completion checkpoint is Drive file `1rRQynkgEgR36Q5Ii1BXc-nK4ssLxcscw`.

## Preservation rules

Two same-named Drive roots (`1fKigp_hlEqqWB0F0DkMeKXTpMQXzPnrv` and `1zidTGx6RHZZ4P8mCic8XDKSZBxhA0QdR`) are preserved as non-canonical duplicates and must not be deleted or merged automatically. Non-authoritative concurrent candidates and superseded folders are archival evidence, not completion records.

## Completion gate

Each reel counts only after its unique package includes claim-level source metadata, a Hindi script, Hindi captions, a vertical final MP4, technical and visual QC records, and a verified Google Drive read-back. Completed reels are never regenerated. The active daily continuation schedule is bounded to one reel per run through 3 December 2026 and has a self-contained playbook; its first execution must be checked because the platform reports its run mode as `ask_user`.
