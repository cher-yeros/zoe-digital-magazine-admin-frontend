import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CustomAutocomplete,
  CustomMultipleAutocomplete,
  FormInput,
  FormSelect,
  FormTextArea,
} from "@/components/widgets/CustomInput";
import type { Schema } from "@/data-schema";
import { useAppSelector } from "@/hooks/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateClient } from "aws-amplify/data";
import { getUrl, uploadData } from "aws-amplify/storage";
import { Image, Trash } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import RichTextEditor from "./RichTextEditor";
import { slugify } from "@/lib/helpers";
const client = generateClient<Schema>();

const blogSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z
    .string()
    .min(10, "Excerpt must be at least 10 characters")
    .max(200, "Excerpt must be less than 200 characters"),

  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),

  cover_image_url: z.string(),
  status: z.enum(["draft", "published", "scheduled", "archived"]),
  // published_at: z.string(),
  // scheduled_at: z.string(),
  // reading_time_minutes: z.number().default(0),
  seo_title: z.string(),
  seo_description: z.string(),
  // is_featured: z.boolean().default(false),

  author_id: z.string().min(1, "Author is required"), //required
  category_id: z.string().min(1, "Category is required"), // required
  // author: z.string().required(),
  // category: z.string().required(),
  // tags: z.string().required(),

  tag_ids: z.array(z.string()).min(1, "At least one tag is required"),
  type: z.enum(["blog", "news"]),
  reading_time_minutes: z.number().min(1, "Reading time is required"),
});

type BlogFormData = z.infer<typeof blogSchema>;

type Category = Schema["BlogCategory"]["type"];
type Tag = Schema["Tag"]["type"];

export default function NewBlog() {
  const { state } = useLocation();
  const { blog, isEdit } = state || {};

  const [isLoading, setIsLoading] = useState(false);
  const [blogId, setBlogId] = useState<string | null>(null);
  const [hasAutoSaved, setHasAutoSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { currentUser } = useAppSelector((state) => state.auth);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [file, setFile] = useState<File | null>();
  const [signedUrl, setSignedUrl] = useState<string | "">("");
  const methods = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      cover_image_url: "",
      status: "draft",
      seo_title: "",
      seo_description: "",
      author_id: currentUser?.userId,
      category_id: "",
      type: blog?.type || "blog",
      reading_time_minutes: 0,
    },
  });

  useEffect(() => {
    if (blog && isEdit) {
      setBlogId(blog.id);

      methods.setValue("title", blog.title);
      methods.setValue("content", blog.content);
      methods.setValue("excerpt", blog.excerpt);
      // methods.setValue("cover_image_url", blog.cover_image_url);
      methods.setValue("status", blog.status);
      methods.setValue("seo_title", blog.seo_title);
      methods.setValue("seo_description", blog.seo_description);
      methods.setValue("type", blog.type);
      methods.setValue("reading_time_minutes", blog.reading_time_minutes);
      methods.setValue("category_id", blog.category?.id);
      methods.setValue(
        "tag_ids",
        blog?.tags.map((tag: { tag: { id: string } }) => tag.tag.id) || []
      );
    }
  }, [blog, isEdit]);

  // const content = methods.watch("content");
  // console.log("content", content);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      setIsLoading(true);
      const signedUrl = await getUrl({
        path: blog?.cover_image_url as string,
      });
      setSignedUrl(signedUrl.url.href);
      setIsLoading(false);
    };
    fetchSignedUrl();
  }, [blog?.cover_image_url]);

  useEffect(() => {
    fetchLookups();
  }, []);

  // Cleanup effect to prevent requests when unmounting
  useEffect(() => {
    return () => {
      // Cleanup any pending requests or intervals
      setHasAutoSaved(false);
      setBlogId(null);
    };
  }, []);

  const fetchLookups = async () => {
    const categories = await client.models.BlogCategory.list();
    const tags = await client.models.Tag.list();
    setCategories(categories.data ?? []);
    setTags(tags.data ?? []);
  };

  const onSubmit = async (data: BlogFormData) => {
    try {
      setIsLoading(true);

      if (!file) {
        toast.error("Please Upload Cover Image Url !");
        return;
      }

      const isValid = await methods.trigger([
        "title",
        "content",
        "excerpt",
        "category_id",
        "tag_ids",
        "type",
        "reading_time_minutes",
      ]);

      if (!isValid) {
        toast.error("Please fill all the required fields!");
        return;
      }

      // generate random file name
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileExtension = file.name.split(".").pop();
      const randomFileName = `cover-${Date.now()}-${randomString}.${fileExtension}`;

      const result = await uploadData({
        path: `blog-cover-images/${randomFileName}`,
        data: file,
      }).result;

      // Create the blog post with all required fields
      const { data: blog, errors } = await client.models.Post.create({
        author_id: data.author_id,
        slug: slugify(data.title),
        category_id: data.category_id,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        cover_image_url: `${result.path}`,
        status: data.status,
        seo_title: data.seo_title,
        seo_description: data.seo_description,
        type: data.type,
        reading_time_minutes: data.reading_time_minutes,
      });

      if (errors && errors?.length > 0) {
        toast.error(errors[0].message);
        return;
      }

      if (!blog) return;

      // Set the blog ID for future updates
      setBlogId(blog.id);

      // Create PostTag relationships for selected tags
      if (data.tag_ids && data.tag_ids.length > 0) {
        for (const tagId of data.tag_ids) {
          await client.models.PostTag.create({
            post_id: blog.id,
            tag_id: tagId,
          });
        }
      }

      toast.success("Blog post saved successfully!");
      // Reset form and file state
      // methods.reset();
      setFile(null);
      setHasAutoSaved(false);
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error("Failed to create blog post");
    } finally {
      setIsLoading(false);
    }
  };

  const updateDraft = async () => {
    if (isSaving) return; // Prevent multiple simultaneous saves

    try {
      setIsSaving(true);

      if (!blogId) {
        console.log("No blog ID available for update");
        return;
      }

      const values = methods.getValues();

      const { data: blog, errors } = await client.models.Post.update({
        id: blogId,
        title: values.title,
        slug: slugify(values.title),
        excerpt: values.excerpt,
        category_id: values.category_id,
        seo_title: values.seo_title,
        seo_description: values.seo_description,
        content: values.content,
        type: values.type,
        reading_time_minutes: values.reading_time_minutes,
      });

      if (errors && errors?.length > 0) {
        toast.error(errors[0].message);
        return;
      }

      if (!blog) return;

      console.log("Draft saved successfully");
    } catch (error) {
      console.error("Error updating draft:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    const performAutoSave = async () => {
      // Only proceed if form is dirty and we have a blog ID
      if (!methods.formState.isDirty || !blogId) return;

      const isFormValid = await methods.trigger([
        "title",
        "content",
        "excerpt",
        "category_id",
        "tag_ids",
        "seo_title",
        "seo_description",
        "type",
        "reading_time_minutes",
      ]);

      if (isFormValid && blogId && !isLoading && !isSaving) {
        try {
          await updateDraft();
          console.log("Auto-save completed");
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }
    };

    // Set up interval for periodic auto-save (every 30 seconds)
    if (blogId) {
      intervalId = setInterval(performAutoSave, 30000);
    }

    // Set up debounced auto-save (3 seconds after last change)
    if (blogId) {
      timeoutId = setTimeout(performAutoSave, 3000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [blogId, methods.formState.isDirty, isLoading]);

  // Initial save when all required fields are filled
  useEffect(() => {
    const performInitialSave = async () => {
      if (blogId || hasAutoSaved || !file || isLoading) return;

      const isFormValid = await methods.trigger([
        "title",
        "content",
        "excerpt",
        "category_id",
        "tag_ids",
        "seo_title",
        "seo_description",
      ]);

      if (isFormValid && !blogId && !hasAutoSaved && file && !isLoading) {
        setHasAutoSaved(true);
        try {
          await onSubmit(methods.getValues());
          console.log("Initial auto-save completed");
        } catch (error) {
          console.error("Initial auto-save failed:", error);
          setHasAutoSaved(false);
        }
      }
    };

    performInitialSave();
  }, [blogId, hasAutoSaved, file, isLoading, methods.formState.isDirty]);

  const onSave = async () => {
    if (!file && !isEdit) {
      toast.error("Please upload a cover image");
      return;
    }

    if (blogId) {
      await updateDraft();
    } else {
      await onSubmit(methods.getValues());
    }
  };

  console.log(blog);
  console.log(methods.getValues());

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="h-full">
        <div className="space-y-6 h-full ">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full ">
            {/* Left column: form fields and notice */}
            <div className="space-y-4 md:col-span-4 pb-5">
              <FormSelect
                label="Post Type"
                name="type"
                control={methods.control}
                placeholder="Select a post type"
                options={[
                  { label: "Blog", value: "blog" },
                  { label: "News", value: "news" },
                ]}
              />

              <div className="flex  gap-2 flex-col">
                <Label className="text-sm font-medium">Cover Image</Label>

                <input
                  type="file"
                  className="hidden"
                  id="cover_image_url"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        methods.setValue(
                          "cover_image_url",
                          e.target?.result as string
                        );
                      };
                      reader.readAsDataURL(file);

                      setFile(file);
                    }
                  }}
                />

                {/* Display the image */}
                {/*  */}
                <div
                  className="flex items-center justify-center gap-2 w-full flex-col border-2 rounded-md p-2 cursor-pointer border-dashed border-gray-300"
                  style={{
                    minHeight: "10rem",
                    // borderColor: !file ? "red" : "gray",
                  }}
                  onClick={() => {
                    document.getElementById("cover_image_url")?.click();
                  }}
                >
                  {isEdit && blog?.cover_image_url && !file && (
                    <img
                      src={signedUrl}
                      alt="Cover Image"
                      className="h-auto w-full rounded-md"
                    />
                  )}

                  {methods.watch("cover_image_url") && (
                    <img
                      src={methods.watch("cover_image_url")}
                      alt="Cover Image"
                      className="h-auto w-full rounded-md"
                    />
                  )}

                  {!methods.watch("cover_image_url") && !isEdit && (
                    <>
                      <Image className="h-10 w-10 rounded-md" />
                      <p className="text-sm text-gray-500 text-center">
                        Click to upload image or drag and drop image here
                      </p>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  color="destructive"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    methods.setValue("cover_image_url", "");
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              <FormTextArea
                label="Blog Title"
                name="title"
                control={methods.control}
                placeholder="Enter your blog post title"
              />

              <FormTextArea
                label="Excerpt"
                name="excerpt"
                control={methods.control}
                placeholder="Brief description of your blog post"
              />

              <CustomAutocomplete
                label="Category"
                name="category_id"
                control={methods.control}
                placeholder="Select a category"
                options={categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                }))}
              />

              <CustomMultipleAutocomplete
                label="Tags"
                name="tag_ids"
                control={methods.control}
                placeholder="Select a tag"
                options={tags.map((tag) => ({
                  label: tag.name,
                  value: tag.id,
                }))}
              />

              <FormInput
                label="Reading Time (in minutes)"
                name="reading_time_minutes"
                control={methods.control}
                placeholder="Reading time in minutes"
                type="number"
              />

              {/* <FormTextArea
                label="SEO Title"
                name="seo_title"
                control={methods.control}
                placeholder="SEO title for search engines"
              />

              <FormTextArea
                label="SEO Description"
                name="seo_description"
                control={methods.control}
                placeholder="SEO description for search engines"
              /> */}

              {/* optional fields */}

              {/* Image Upload Section */}

              {/* <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium text-blue-900 mb-2">
              Tips for a great blog post:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Write a compelling title that grabs attention</li>
              <li>• Keep your excerpt concise but informative</li>
              <li>• Use relevant tags to help readers find your content</li>
              <li>• Include a high-quality featured image</li>
              <li>• Structure your content with clear headings</li>
            </ul>
          </div> */}
            </div>

            {/* Right column: text editor */}
            <div className="flex flex-col h-full md:col-span-8 pb-5">
              <Controller
                name="content"
                control={methods.control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    onSave={onSave}
                  />
                )}
              />
            </div>
          </div>

          {/* <Button type="submit" className="w-fit">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button> */}
        </div>
      </form>
    </FormProvider>
  );
}
