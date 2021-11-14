module.exports = ({ env }) => ({
    upload: {
        provider: 'cloudinary',
        providerOptions: {
            cloud_name: env('CLOUDINARY_NAME'),
            api_key: env('CLOUDINARY_KEY'),
            api_secret: env('CLOUDINARY_SECRET'),
        },
        actionOptions: {
            upload: {
                folder: 'bodhi-mock-trading',
                width: 100,
                height: 100,
                crop: "fit"
            },
        },
    }
});