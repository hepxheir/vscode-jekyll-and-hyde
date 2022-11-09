import * as vscode from "vscode";
import Page from "./page";

export default class Category {
    public readonly label: string;
    public readonly parent?: Category;
    private readonly subcategories: Category[] = [];
    private readonly posts: Page[] = [];

    constructor(label: string, parent?: Category) {
        this.label = label;
        this.parent = parent;
    }

    get children(): (Category | Page)[] {
        return [...this.subcategories, ...this.posts];
    }

    get size(): number {
        return this._size();
    }

    private _size(): number {
        let nItems = this.posts.length;
        for (const category of this.subcategories) {
            nItems += category.size;
        }
        return nItems;
    }

    findCategoryByLabel(label: string): Category | undefined {
        return this.subcategories.find(category => category.label == label);
    }

    createSubcategory(label: string): Category {
        const subcategory = new Category(label, this);
        this.addSubcategory(subcategory);
        return subcategory;
    }

    private addSubcategory(category: Category) {
        this.subcategories.push(category);
        this.subcategories.sort(compareCategories);
    }

    addPost(post: Page) {
        this.posts.push(post);
        this.posts.sort(comparePosts);
    }

    findPostByUri(uri: vscode.Uri): Page | undefined {
        return this._findPostByUri(uri);
    }

    private _findPostByUri(uri: vscode.Uri): Page | undefined {
        for (const post of this.posts) {
            if (vscode.Uri.file(post.path).fsPath == uri.fsPath) {
                return post;
            }
        }
        for (const subcategory of this.subcategories) {
            const post = subcategory.findPostByUri(uri);
            if (post) {
                return post;
            }
        }
        return undefined;
    }

    toStringArray(): string[] {
        const arr: string[] = [];
        let current: Category | undefined = this;
        while (current.parent) {
            arr.push(current.label);
            current = current.parent;
        }
        return arr.reverse();
    }
}

function compareCategories(prevCategory: Category, nextCategory: Category): number {
    return prevCategory.label.localeCompare(nextCategory.label);
}

function comparePosts(prevPost: Page, nextPost: Page): number {
    return new Date(prevPost.date).getTime() - new Date(nextPost.date).getTime();
}