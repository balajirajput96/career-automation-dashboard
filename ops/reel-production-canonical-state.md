# Canonical Hindi Reel Production State

## Verified recovery point

The canonical Google Drive workspace is `3000_HINDI_RESEARCH_REELS` with root ID `1-sIkvOsLlfTCY4CPC0Cb1B6St72UrqFj`. Its active `Batch_001` folder is `1hz2gSOMAWzfG0_vasKunhxG8rhscD7U4`.

The verified checkpoint lineage now records **17** complete, read-back-verified Drive packages for Reels `0001` through `0017`. Reel 0017 is `QC_PASSED_AND_DRIVE_READBACK_VERIFIED`; its final video is Drive file `1TJcTTxncTbDVm332AW7Y-l0mNemoG7ia`, and its package folder is `1OvDmCsqSgO18xRnjTchVjnag3e35O88d`.

The current resume authority is `checkpoint_after_reel_0017_20260825T125800Z.json` (Drive file `1c9TfExMZpx34rd7moF04LBYDfUekYmfS`). It instructs the pipeline to resume at **Reel 0018** in `Batch_001`. The preceding Reel 0016 checkpoints remain preserved as historical evidence.

## Preservation rules

Two same-named Drive roots (`1fKigp_hlEqqWB0F0DkMeKXTpMQXzPnrv` and `1zidTGx6RHZZ4P8mCic8XDKSZBxhA0QdR`) are preserved as non-canonical duplicates and must not be deleted or merged automatically. Non-authoritative concurrent candidates and superseded folders are archival evidence, not completion records.

## Completion gate

Each reel counts only after its unique package includes claim-level source metadata, a Hindi script, Hindi captions, a vertical final MP4, technical and visual QC records, and a verified Google Drive read-back. Completed reels are never regenerated. The active daily continuation schedule is bounded to one reel per run through 3 December 2026 and has a self-contained playbook; its first execution must be checked because the platform reports its run mode as `ask_user`.
