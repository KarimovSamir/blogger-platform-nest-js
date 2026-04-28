export class Blog {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    deletedAt: Date | null;
    createdAt: string;
    isMembership: boolean;

    static createInstance(
        name: string,
        description: string,
        websiteUrl: string,
    ): Blog {
        const blog = new Blog();
        blog.name = name;
        blog.description = description;
        blog.websiteUrl = websiteUrl;
        return blog;
    }

    update(dto: { name: string; description: string; websiteUrl: string }) {
        this.name = dto.name;
        this.description = dto.description;
        this.websiteUrl = dto.websiteUrl;
    }

    makeDeleted() {
        if (this.deletedAt !== null) {
            throw new Error('Entity already deleted');
        }
        this.deletedAt = new Date();
    }
}
