/**
 * ============================================================================
 * ANTI-FRAUD & INTEGRITY ENGINE
 * Perceptual Image Hashing (pHash), Speedrun Detection & Reservation Guards
 * ============================================================================
 */

export class FraudShield {
  /**
   * Generates a perceptual hash from an image file using an HTML5 canvas.
   * Scales image down to an 8x8 grayscale grid, computes average brightness,
   * and builds a 64-bit binary string represented as a 16-char hex signature.
   */
  static async computeImagePHash(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 8;
          canvas.height = 8;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 8, 8);

          const imgData = ctx.getImageData(0, 0, 8, 8).data;
          let sum = 0;
          const grays = [];

          for (let i = 0; i < imgData.length; i += 4) {
            // Luminance formula
            const gray = (imgData[i] * 0.299) + (imgData[i + 1] * 0.587) + (imgData[i + 2] * 0.114);
            grays.push(gray);
            sum += gray;
          }

          const avg = sum / 64;
          let hashBin = '';
          for (let i = 0; i < 64; i++) {
            hashBin += (grays[i] >= avg ? '1' : '0');
          }

          // Convert 64-bit binary to hex
          let hex = '';
          for (let i = 0; i < 64; i += 4) {
            hex += parseInt(hashBin.substr(i, 4), 2).toString(16);
          }

          resolve(hex);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Calculates the Hamming distance between two hex hashes.
   */
  static getHammingDistance(hash1, hash2) {
    if (!hash1 || !hash2) return 99;
    let dist = 0;
    const len = Math.min(hash1.length, hash2.length);
    for (let i = 0; i < len; i++) {
      const b1 = parseInt(hash1[i], 16);
      const b2 = parseInt(hash2[i], 16);
      let xor = b1 ^ b2;
      while (xor > 0) {
        dist += (xor & 1);
        xor >>= 1;
      }
    }
    return dist;
  }

  /**
   * Verifies submission against existing submissions within the campaign.
   */
  static checkDuplicateSubmission(newHash, existingSubmissions) {
    if (!newHash) return { isDuplicate: false };

    for (const sub of existingSubmissions) {
      if (sub.proofHash) {
        const dist = this.getHammingDistance(newHash, sub.proofHash);
        if (dist <= 3) {
          return {
            isDuplicate: true,
            matchedSubmissionId: sub.id,
            workerName: sub.workerName,
            confidence: Math.round((1 - (dist / 64)) * 100)
          };
        }
      }
    }
    return { isDuplicate: false };
  }

  /**
   * Enforces minimum execution time to prevent automated bot speedrunning
   */
  static checkSpeedrun(startTimeMs, minSecondsAllowed = 30) {
    const elapsedSeconds = Math.floor((Date.now() - startTimeMs) / 1000);
    if (elapsedSeconds < minSecondsAllowed) {
      return {
        isSpeedrun: true,
        elapsedSeconds,
        minRequired: minSecondsAllowed
      };
    }
    return { isSpeedrun: false, elapsedSeconds };
  }
}
