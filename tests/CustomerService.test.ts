import { describe, it, expect, beforeEach, mock } from "bun:test";
import { PrismaClient } from "@prisma/client";
import CustomerService from "../services/CustomerService";

// Mock Customers
const mockCustomers = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Doe" },
];

// Mock PrismaClient
const prismaMock = {
  customer: {
    findMany: mock(() => mockCustomers),
    findUnique: mock((query) =>
      mockCustomers.find((c) => c.id === query.where.id)
    ),
    create: mock((query) => {
      const customer = {
        id: mockCustomers.length + 1,
        name: query.data.name,
      };
      mockCustomers.push(customer);
      return customer;
    }),
    update: mock((query) => {
      const customer = mockCustomers.find((c) => c.id === query.where.id);
      if (customer) {
        customer.name = query.data.name;
      }
    }),
    delete: mock((query) => {
      const index = mockCustomers.findIndex((c) => c.id === query.where.id);
      if (index !== -1) {
        mockCustomers.splice(index, 1);
      }
    }),
  },
};

mock.module("@prisma/client", () => {
  return { PrismaClient: mock(() => prismaMock) };
});

const prisma = new PrismaClient();
const customerService = new CustomerService(prisma);

describe("CustomerService", () => {
  beforeEach(() => {
    prismaMock.customer.findMany.mockClear();
    prismaMock.customer.findUnique.mockClear();
    prismaMock.customer.create.mockClear();
    prismaMock.customer.update.mockClear();
    prismaMock.customer.delete.mockClear();
  });

  it("should fetch all customers", async () => {
    const customers = await customerService.getAllCustomers();
    expect(customers).toEqual(mockCustomers);
    expect(prismaMock.customer.findMany).toHaveBeenCalledTimes(1);
  });

  it("should fetch a customer by ID", async () => {
    const customer = await customerService.getCustomerById(1);
    expect(customer).toEqual(mockCustomers[0]);
    expect(prismaMock.customer.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  // Add more tests for create, update, delete operations
  it("should create a customer", async () => {
    const customer = await customerService.createCustomer("Alice Doe");
    expect(customer.id).toEqual(3);
    expect(prismaMock.customer.create).toHaveBeenCalledWith({
      data: { name: "Alice Doe" },
    });
  });

  it("should update a customer", async () => {
    await customerService.updateCustomer(1, "James Doe");
    expect(mockCustomers[0].name).toEqual("James Doe");
    expect(prismaMock.customer.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: "James Doe" },
    });
  });

  it("should delete a customer", async () => {
    await customerService.deleteCustomer(1);

    expect(mockCustomers.find((t) => t.id === 1)).not.toBeDefined();
    expect(prismaMock.customer.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});
