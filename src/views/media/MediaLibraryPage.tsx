import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MediaLibraryPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900">Media Library</h1>
        <p className="text-sm text-gray-600">
          Upload, organize, and manage magazine assets in one place.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">
            Coming soon
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          The media library is being prepared. Check back shortly to manage
          images, documents, and other assets.
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaLibraryPage;



