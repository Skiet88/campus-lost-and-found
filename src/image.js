'use strict';

/**
 * Image.js
 * Represents an image uploaded and stored on Cloudinary.
 * Business rules:
 *   - Only JPG and PNG accepted
 *   - Max file size: 5MB
 *   - One image per ItemReport
 *   - Report can still be submitted if upload fails
 * Relates to: T-008, DOMAIN_MODEL.md Entity 5
 */

const { v4: uuidv4 } = require('uuid');

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

class Image {
  /**
   * @param {string} itemId
   * @param {string} cloudinaryUrl
   * @param {string} publicId - Cloudinary public ID for deletion
   * @param {number} fileSize - bytes
   * @param {string} fileType - MIME type
   */
  constructor(itemId, cloudinaryUrl, publicId, fileSize, fileType) {
    if (!itemId) throw new Error('itemId is required');

    this._imageId = uuidv4();
    this._itemId = itemId;
    this._cloudinaryUrl = cloudinaryUrl || null;
    this._publicId = publicId || null;
    this._fileSize = fileSize || 0;
    this._fileType = fileType || null;
    this._uploadedAt = new Date();
    this._isUploaded = false;
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get imageId() { return this._imageId; }
  get itemId() { return this._itemId; }
  get cloudinaryUrl() { return this._cloudinaryUrl; }
  get publicId() { return this._publicId; }
  get fileSize() { return this._fileSize; }
  get fileType() { return this._fileType; }
  get uploadedAt() { return this._uploadedAt; }
  get isUploaded() { return this._isUploaded; }

  // ── Methods ───────────────────────────────────────────────────────────────

  /**
   * Validates file type against allowed types.
   * @param {string} mimeType
   * @returns {boolean}
   */
  validateFileType(mimeType) {
    return ALLOWED_TYPES.includes((mimeType || '').toLowerCase());
  }

  /**
   * Validates file size is within limit.
   * @param {number} sizeBytes
   * @returns {boolean}
   */
  validateFileSize(sizeBytes) {
    return typeof sizeBytes === 'number' && sizeBytes > 0 && sizeBytes <= MAX_SIZE_BYTES;
  }

  /**
   * Simulates uploading an image to Cloudinary.
   * In production this calls the Cloudinary SDK.
   * @param {{ url: string, publicId: string, fileSize: number, fileType: string }} uploadResult
   * @returns {string} the cloudinary URL
   */
  uploadImage(uploadResult) {
    const { url, publicId, fileSize, fileType } = uploadResult;

    if (!this.validateFileType(fileType)) {
      throw new Error(`Invalid file type: ${fileType}. Only JPG and PNG are allowed.`);
    }
    if (!this.validateFileSize(fileSize)) {
      throw new Error(`File size ${fileSize} bytes exceeds the 5MB limit.`);
    }
    if (!url) throw new Error('Cloudinary URL is required');

    this._cloudinaryUrl = url;
    this._publicId = publicId;
    this._fileSize = fileSize;
    this._fileType = fileType;
    this._uploadedAt = new Date();
    this._isUploaded = true;

    return this._cloudinaryUrl;
  }

  /**
   * Removes image from Cloudinary (stub — real impl calls cloudinary.uploader.destroy).
   */
  deleteImage() {
    if (!this._publicId) throw new Error('No publicId — image was never uploaded');
    const deletedPublicId = this._publicId;
    this._cloudinaryUrl = null;
    this._publicId = null;
    this._isUploaded = false;
    return { deleted: deletedPublicId };
  }

  toJSON() {
    return {
      imageId: this._imageId,
      itemId: this._itemId,
      cloudinaryUrl: this._cloudinaryUrl,
      publicId: this._publicId,
      fileSize: this._fileSize,
      fileType: this._fileType,
      uploadedAt: this._uploadedAt,
      isUploaded: this._isUploaded,
    };
  }
}

module.exports = Image;