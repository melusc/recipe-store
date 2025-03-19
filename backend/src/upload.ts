import multer, {memoryStorage} from 'multer';

const fileSizeLimit = 10_485_760; // 10 MB

export const formdataMiddleware = multer({
	storage: memoryStorage(),
	limits: {
		fileSize: fileSizeLimit,
	},
});
