module.exports = {
  openapi: "3.0.0",
  info: {
    title: "TEST API BE",
    version: "1.0.0",
    description: "API UNTUK APLIKASI TEST",
  },
  servers: [
    {
      url: "https://test-exporessjs.vercel.app/",
    },
  ],
  paths: {
    "/api/products": {
      get: {
        summary: "Get all products",
        tags: ["Products"],
        responses: {
          200: {
            description: "List of products",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new product",
        tags: ["Products"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "price", "description"],
                properties: {
                  name: { type: "string" },
                  price: { type: "number" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Product created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid input",
          },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        summary: "Get a product by encrypted ID",
        tags: ["Products"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            description: "Encrypted product ID",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Product found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid encrypted ID",
          },
          404: {
            description: "Product not found",
          },
        },
      },
      put: {
        summary: "Update a product by encrypted ID",
        tags: ["Products"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            description: "Encrypted product ID",
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "price", "description"],
                properties: {
                  name: { type: "string" },
                  price: { type: "number" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Product updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid encrypted ID",
          },
          404: {
            description: "Product not found",
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        summary: "Register user baru",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "phone", "username", "password", "address"],
                properties: {
                  name: { type: "string" },
                  phone: { type: "string" },
                  username: { type: "string" },
                  password: { type: "string" },
                  address: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Registrasi berhasil",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          409: { description: "Username sudah digunakan" },
          400: { description: "Field wajib diisi" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login user",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login berhasil",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    token: { type: "string" },
                    user: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          401: { description: "Password salah" },
          404: { description: "User tidak ditemukan" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        summary: "Ambil profile user saat ini",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Profil ditemukan",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          404: { description: "User tidak ditemukan" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/auth/update": {
      put: {
        summary: "Update profile user",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "phone", "address"],
                properties: {
                  name: { type: "string" },
                  phone: { type: "string" },
                  address: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Profil berhasil diupdate",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          400: { description: "Field tidak boleh kosong" },
          401: { description: "Unauthorized" },
          500: { description: "Terjadi kesalahan server" },
        },
      },
    },
  },
  components: {
    schemas: {
      Product: {
        type: "object",
        properties: {
          id: { type: "string", example: "ABC123==" },
          name: { type: "string", example: "Product A" },
          price: { type: "number", example: 15000 },
          description: { type: "string", example: "A very good product" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "number", example: 1 },
          name: { type: "string", example: "John Doe" },
          phone: { type: "string", example: "081234567890" },
          username: { type: "string", example: "johndoe" },
          address: { type: "string", example: "Jalan Mawar No. 123" },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};
